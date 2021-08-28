try{ JL = JL; } catch(e){ JL = {}; }

JL.keyboard = function( bindings, callbacks ){
	var self = this;

	this.callbacks = callbacks || {};

	this.keycodes = {
		"BACKSPACE"        :   8,
		"TAB"              :   9,
		"ENTER"            :  13,
		"SHIFT"            :  16,
		"CTRL"             :  17,
		"ALT"              :  18,
		"PAUSE BREAK"      :  19,
		"CAPS LOCK"        :  20,
		"ESCAPE"           :  27,
		"SPACEBAR"         :  32,
		"PAGE UP"          :  33,
		"PAGE DOWN"        :  34,
		"END"              :  35,
		"HOME"             :  36,
		"LEFT ARROW"       :  37,
		"UP ARROW"         :  38,
		"RIGHT ARROW"      :  39,
		"DOWN ARROW"       :  40,
		"INSERT"           :  45,
		"DELETE"           :  46,
		"0"                :  48,
		"1"                :  49,
		"2"                :  50,
		"3"                :  51,
		"4"                :  52,
		"5"                :  53,
		"6"                :  54,
		"7"                :  55,
		"8"                :  56,
		"9"                :  57,
		"A"                :  65,
		"B"                :  66,
		"C"                :  67,
		"D"                :  68,
		"E"                :  69,
		"F"                :  70,
		"G"                :  71,
		"H"                :  72,
		"I"                :  73,
		"J"                :  74,
		"K"                :  75,
		"L"                :  76,
		"M"                :  77,
		"N"                :  78,
		"O"                :  79,
		"P"                :  80,
		"Q"                :  81,
		"R"                :  82,
		"S"                :  83,
		"T"                :  84,
		"U"                :  85,
		"V"                :  86,
		"W"                :  87,
		"X"                :  88,
		"Y"                :  89,
		"Z"                :  90,
		"LEFT WINDOW KEY"  :  91,
		"RIGHT WINDOW KEY" :  92,
		"SELECT KEY"       :  93,
		"NUMPAD 0"         :  96,
		"NUMPAD 1"         :  97,
		"NUMPAD 2"         :  98,
		"NUMPAD 3"         :  99,
		"NUMPAD 4"         : 100,
		"NUMPAD 5"         : 101,
		"NUMPAD 6"         : 102,
		"NUMPAD 7"         : 103,
		"NUMPAD 8"         : 104,
		"NUMPAD 9"         : 105,
		"MULTIPLY"         : 106,
		"ADD"              : 107,
		"SUBTRACT"         : 109,
		"DECIMAL POINT"    : 110,
		"DIVIDE"           : 111,
		"F1"               : 112,
		"F2"               : 113,
		"F3"               : 114,
		"F4"               : 115,
		"F5"               : 116,
		"F6"               : 117,
		"F7"               : 118,
		"F8"               : 119,
		"F9"               : 120,
		"F10"              : 121,
		"F11"              : 122,
		"F12"              : 123,
		"NUM LOCK"         : 144,
		"SCROLL LOCK"      : 145,
		";"                : 186,
		"="                : 187,
		","                : 188,
		"-"                : 189,
		"."                : 190,
		"/"                : 191,
		"`"                : 192,
		"["                : 219,
		"BACK SLASH"       : 220,
		"]"                : 221,
		"'"                : 222
	};

	this.keys = bindings;

	this.keys.forEach(function( key ){
		key.code = this.keycodes[ key.name ];
	}, this);

	this.holdable_keys = this.keys.filter(function(key){ return key.hold; });

	this.pressed = [];

	document.addEventListener('keydown', function(event) {
		if( !self.disabled || self.disabled_exceptions ){
			if( self.pressed.indexOf(event.keyCode) == -1 ){
				var key = self.get_from_keycode(event.keyCode);
				if( key ){
					if( self.disabled_exceptions ){
						if( self.disabled_exceptions.indexOf( key.name ) == -1 ) return;
					}
					self.pressed.push( event.keyCode );
					key.pressed = true;
					if( key.down ) key.down();
				}
			}

			if( self.callbacks.on_key_down ) self.callbacks.on_key_down();
		}
	});

	document.addEventListener('keyup', function(event) {
		if( !self.disabled || self.disabled_exceptions ){
			var key = self.get_from_keycode( event.keyCode );
			if( key ){
				if( self.disabled_exceptions ){
					if( self.disabled_exceptions.indexOf( key.name ) == -1 ) return;
				}

				var pressed_index = self.pressed.indexOf( event.keyCode );
				if( pressed_index != -1 ) self.pressed.splice( pressed_index, 1 );
				if( key.up ) key.up();

				key.pressed = false;
			}

			if( self.callbacks.on_key_up ) self.callbacks.on_key_up();
		}
	});
};

JL.keyboard.prototype.get = function(name){
	var keys = this.keys.filter(function(key){ return key.name == name; });
	if(keys.length > 0) return keys.pop();
	return false;
};

JL.keyboard.prototype.get_from_keycode = function(code){
	var keys = this.keys.filter(function(key){ return key.code == code; });
	if(keys.length > 0) return keys.pop();
	return false;
};

JL.keyboard.prototype.clear_all = function(){
	this.pressed = [];
	this.keys.forEach(function(key){
		key.pressed = false;
	});
};

JL.keyboard.prototype.enable = function(){
	this.disabled = false;
	this.disabled_exceptions = false;

	if( this.callbacks.on_enable ) this.callbacks.on_enable();
};

JL.keyboard.prototype.disable = function( disabled_exceptions ){
	this.disabled = true;
	this.disabled_exceptions = disabled_exceptions || false;

	this.clear_all();

	if( this.callbacks.on_disable ) this.callbacks.on_disable();
};

JL.keyboard.prototype.loop = function(){
	var self = this;
	if( !this.disabled || this.disabled_exceptions ){
		var keys = this.holdable_keys;
		if( this.disabled_exceptions ) keys = keys.filter( x => self.disabled_exceptions.indexOf( x.name ) != -1 );
		keys.forEach(function(key){
			if(key.pressed) key.hold();
		});
	}
};
