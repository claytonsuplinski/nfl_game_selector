SEL.keyboard = new JL.keyboard(
	[
		{ name :  'LEFT ARROW', down : function(){ SEL.selector.next_week( -1 ); } },
		{ name : 'RIGHT ARROW', down : function(){ SEL.selector.next_week(  1 ); } },
	]
);