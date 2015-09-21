/*mainline definitions*/
const DEFAULT_MAP_LABEL_FONT = "12pt Georgia";
const SVG_NS = 'http://www.w3.org/2000/svg';

const MODE = {
	EXIT: 0,
	INFO: 1,
	ATTACK: 2,
	BUY: 3,
	SELL: 4,
	GIVE: 5,
	SEND: 6,
	SPY: 7,
	SAVE: 16,
	LOAD: 17
}

const FIRST_TURN = {month: 1, year: 475}
const SPY_TIMEOUT = 12;
const GRABBAG_SIZE = 100;
var lbl_pfx = 'lbl_';
//Just get a bunch of rands every now and then since we need so many each turn.
var grabbag = [];
//Cause generation on first use
var bagCounter = GRABBAG_SIZE;

var utils = {
		offsetX : function(node) {
			var box = node.getBoundingClientRect(),
				scroll = window.pageXOffset;
				
			return Math.round(box.left + scroll);
		},
		offsetY : function(node) { 
			var box = node.getBoundingClientRect(),
				scroll = window.pageYOffset;
				
			return Math.round(box.top + scroll);
		},
		rightX : function(x) {
			return x-app.getOffset('x');
		},
		rightY : function(y) {
			return y-app.getOffset('y');
		},
		trim : function(str) {
			return str.replace(/^\s+|\s+$/g, '');
		},
		id : function (str) {
			return d3.select('#' + str);
		},
		hide : function(node) {
			node.style('display', 'none');
			
			return this;
		},
		show : function(node) {
			node.style('display', 'block');
			
			return this;
		},
		encode : function(str) {
			return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		},
		stopEvent : function(e) {
			e.stopPropagation();
			e.preventDefault();
			
			return this;
		},
		addClass : function(node, str) {
			// node.className.baseVal for SVG-elements
			// or
			// node.className for HTML-elements
			node.classed('str', true);
			
			return this;
		},
		removeClass : function(node, str) {
			node.classed('str', false);
			
			return this;
		},
		hasClass : function(node, str) {
			var is_svg = node.className.baseVal !== undefined ? true : false,
				arr = is_svg ? node.className.baseVal.split(' ') : node.className.split(' '),
				isset = false;
				
			_.each(arr, function(x) {
				if(x === str) {
					isset = true;
				}
			});
			
			return isset;
		},
		extend : function(obj, options) {
			var target = {};
			
			for (name in obj) {
				if(obj.hasOwnProperty(name)) {
					target[name] = options[name] ? options[name] : obj[name];
				}
			}
			
			return target;
		},
		supportFileReader : (function() {
			return (typeof FileReader !== 'undefined');
		})(),
		getRand: function(offx, dx) {
			offx=offx?offx:0;
			dx=dx?dx:0;
			if (bagCounter >= GRABBAG_SIZE) {
				bagCounter = 0;
				for (var n = 0; n <= GRABBAG_SIZE; n++) {
					grabbag[n] = Math.random();
				}
			}
			return Math.floor(1 + offx + (dx * grabbag[bagCounter++]));
		}
	};
	

var initialized = false;

var game_mode = MODE.INFO;

var game_clock = FIRST_TURN;

var selected_state = '';

/*A Turn is the frame of the market for procedural generation.
 *Note: this.commodity.price is the static _base_ price, while this.price is the
 *		dynamic current price.*/
var Turn =  function(values) {
	this.year = values.year;
	this.month = values.month;

	//foreign key --> State.name
	this.state = values.state;
	//foreign key --> Commodity.name
	this.commodity = values.commodity;
	this.initial = values.initial;
	this.produced = values.produced;
	this.used = values.used;
	this.price = values.price;
	/*Nearby disasters, etc*/
	this.remark = values.remark;
}

var Commodity = function(values) {
	/*what it's called*/
	this.name=values.name;
	/*equilibrium price*/
	this.price=values.price;	
}

var State = function(values) {
	this.name = values.name;
	this.shape = values.shape;
	this.ppl = values.ppl;
	this.soldiers = values.soldiers;
	this.fields = values.fields;
	this.disasters = values.disasters;
	this.neighbors = values.neighbors;
}

var Nation = function(values) {
	this.name = values.name;
	this.states = values.states;
	this.color = values.color;
	this.demonym = values.demonym;
}

/*Emperor represents the player*/
var Emperor = function(values) {
	//state, time pairs
	var last_spy={};
	this.name = values.name;
	this.nation = values.nation;
	
	for (n in db.getCollection('nations').data) {
		nname = n.name;
		last_spy.nname = FIRST_TURN;
	}

	var send_spy = function(state) {

	}
}

var gdata = require('./gdata.js');
var econ = require('./microeconomics.js');
var _ = require('lodash');
var loki = require('lokijs');
var d3 = require('d3');

var db = new loki('game_data.json');
var l_states = db.addCollection('states');
var l_nations = db.addCollection('nations');
var l_commodities = db.addCollection('commodities');
var l_player = db.addCollection('player');
var l_market = db.addCollection('market', {indices: ['year', 'month', 'state', 'commodity']});

var init = function() {
	var i_states = new gdata.states();
	var i_nations = new gdata.nations();
	var i_commodities = new gdata.commodities();
	l_states.ensureUniqueIndex('name');
	l_nations.ensureUniqueIndex('name');
	l_commodities.ensureUniqueIndex('name');
	_.each(i_states, function (s) {l_states.insert(new State(s))});
	_.each(i_nations, function (n) {l_nations.insert(new Nation(n))});
	_.each(i_commodities, function (c) {l_commodities.insert(new Commodity(c))});
	l_player.insert(new Emperor({name:'Atilla', nation:'Hun'}));
	//market initial state
	_.each(i_states, function(s) {
		_.each(i_commodities, function(c) {
			l_market.insert(new Turn({
				year: game_clock.year, 
				month: game_clock.month,
				state: s.name,
				commodity: c.name,
				initial: utils.getRand(200,1800),
				produced: 0,
				used: 0,
				price: c.price,
				remark: 'first turn'
			}));
		});	
	});
}

//utils
var attr = function(elt, map) {
	for (entry in map) {
		elt.setAttribute(map[entry][0], map[entry][1]);
	}
}

/*collate a flat array of numbers into the specification of the 'd' attribute*/
var d_attr = function(polygon) {
	var path = '';
	for (var component=0; component < polygon.length; component++) {
		//alternate assignment of x, y until no more coords
		var weight = polygon[component];
		var vertex = '';
		//first vertex is 'move_to' event the rest are 'line_to' events
		if (component % 2 == 0) {
			vertex += (component==0)?'M ':'L ';
		}
		//spaces separate x,y pairs
		vertex += weight + ' ';
		path += vertex;
	}
	//connect last vertex to first vertex
	path += 'z';
	return path;
}

/**run function @fun over loki collection by name @coll, 
	where coll is filtered by comparison function @cmp*/
var lod_for = function(coll, fun, cmp) {
	var target = db.getCollection(coll).data;
	var sample = cmp?_.filter(target, cmp):target;
	_.each(sample, fun(elt));
}

var nation_of_state = function(nations, state) {
	for (n in nations) {
		var sl = nations[n].states;
		for(s in sl) {
			var state_in = sl[s]
			if(state == state_in) {
				return nations[n];
			}		
		}
	}

	return null;
}

var state_color = function(state) {
	/*select color from nations where nations.states contains state.name*/
	var nation = nation_of_state(l_nations.data, state);
	var color = nation.color;
	return color;
}


var get_last_spy = function(nation, state) {
	//if this is our kingdom, we have spy now
	if(nation == nation_of_state(state)) {
		return game_clock;
	}
	//elseif no entry, return first turn
	//else return last_spy.Nation
	else {
		return last_spy.nation;
	}
}
/*submodule definitions*/
//console.log(i_data[0]);


/*KBD*/
/*WASD to scroll map panel, QE to zoom out/in*/
var KEYS = {
	W: 87,
	A: 65,
	S: 83,
	D: 68,
	Q: 81,
	E: 69
};

onDocumentKeydown = function(e) {
	switch(e.keyCode) {
		case KEYS.W:
			//scrollMap('top');
			break;
		case KEYS.A:
			//scrollMap('left');
			break;
		case KEYS.S:
			//scrollMap('down');
			break;
		case KEYS.D:
			//scrollMap('right');
			break;
		case KEYS.Q:
			//zoomMap('in');
			break;
		case KEYS.E:
			//zoomMap('out');
			break;
	}
}

/*GUI*/
var map_layer = utils.id('map_layer');
var map_label_font = DEFAULT_MAP_LABEL_FONT;

/*draw_polygon @state must have properties {name: string, shape: number array}*/
var draw_polygon = function(context, state, style) {
	context.append('path')
		.attr({'d': d_attr(state.shape), 'class': 'state', 'id': state.name})
		.style({'fill': state_color(state.name),
			'fill-opacity': style.alpha, 
			'stroke': style.stroke, 
			'stroke-width': style.lineWidth});	
}

var highlight_polygon = function(state_name) {
	utils.id(state_name)
		.style({'stroke-width': '3', 'stroke': 'red', 'fill-opacity': '0.81'});
}

var unhighlight_polygon = function(state_name) {
	utils.id(state_name)
		.style({'stroke-width': '1', 'stroke': 'blue', 'fill-opacity': '0.4'});
}

/*draw title*/
var draw_title = function(context, output, where) {
	context.append('text')
			.attr({'x': where.x, 'y': where.y, 'id': lbl_pfx + output})
			.style({'font-family':'Georgia', 'font-size': '12pt', 
					'fill': 'black', 'text-anchor' : 'middle'})
			.text(output);
}

var get_center = function(shape) {
	var sum_x=0, sum_y=0;
	var vertices = _.chunk(shape, 2);
	_.each(vertices, 
		function(vertex) {
			sum_x += vertex[0];
			sum_y += vertex[1];
		});
	var center = {x: sum_x/vertices.length,
			y: sum_y/vertices.length};
	return center;
}

var draw_details = function(options) {
	var states = db.getCollection('states').data;
	var border_layer = d3.select('div').append('svg')
		.attr({'width': 2298,'height': 1730})
		.style({'background-color':'transparent', 'text-align':'center',
				'position': 'absolute', 'z-index': 2});
	_.each(states, function (s) {
		draw_polygon(border_layer, s, {'stroke':'blue', 'stroke-width': '1px', 'alpha': '0.4'});
	});
	_.each(states, function (s) {
		draw_title(border_layer, s.name, get_center(s.shape));
	});
}

var draw_map = function(options) {
	//console.log(countries_graph)
	//draw background
	var map_bg = document.getElementById('map_layer');
	map_bg.src='./germanic_roman_486_1923.jpg';
	map_bg.alt='Germanic tribes and Rome in 486 A.D.';
	
}

var map_event_handler = function() {
	d3.selectAll('path').on({
		mouseenter: function() {
			if (selected_state != this.id) {
				highlight_polygon(this.id);
			}
			return;
		},			
		mouseleave: function() {
			if (selected_state != this.id) {
				unhighlight_polygon(this.id);
			}
			return;	
		},
		click: function() {
			switch(game_mode) {
				case MODE.INFO:
					//show known info in a pop up
					if (selected_state == this.id) {
						selected_state = '';
					} else {
						if (selected_state != '') {
							unhighlight_polygon(selected_state);
						}
						selected_state = this.id;
						show_info(this.id);
					}
					break;
			}
			return;
		}
	});

	d3.selectAll('text').on({
			mouseenter: function() {
			//parent, or id of the path element this label is upon displayed
				if (selected_state != this.id.substring(lbl_pfx.length, this.id.length)) {
					highlight_polygon(this.id.substring(lbl_pfx.length, this.id.length));
				}
				return;
			},			
			mouseleave: function() {
				if (selected_state != this.id.substring(lbl_pfx.length, this.id.length)) {
					unhighlight_polygon(this.id.substring(lbl_pfx.length, this.id.length));
				}
				return;	
			},
			click: function() {
				switch(game_mode) {
					case MODE.INFO:
						//show known info in a pop up
						if (selected_state == this.id.substring(lbl_pfx.length, this.id.length)) {
							selected_state = '';
						} else {
							if (selected_state != '') {
								unhighlight_polygon(selected_state);
							}
							selected_state = this.id.substring(lbl_pfx.length, this.id.length);
							show_info(this.id.substring(lbl_pfx.length, this.id.length));
						}
						break;
				}
				return;
			}
		});
}

var draw_gui = function(context, options) {
	/*adjust viewport size to fit screen resolution.*/
	/*draw a navbar with semi-transparency.*/
	var viewport = d3.select('#viewport');
}

var show_info = function(state_name) {
	//calculate data to display
	var info_turn = get_last_spy(l_player.data.nation, state_name);
	var info_text = 'last updated: '+info_turn.month+'.'+info_turn.year+'<br />';
	var info_dataset = l_market.where(function(doc) {
			if (doc.year == info_turn.year && 
					doc.month == info_turn.month &&
					doc.state == state_name) { 
				return true;
			} else {
				return false;
			}
		});
	_.each(info_dataset, function (commodity) {
		info_text += commodity.commodity + '&nbsp;&nbsp;&nbsp;&nbsp;' 
				+ commodity.initial + '&nbsp;&nbsp;&nbsp;&nbsp;' 
				+ commodity.remark + '<br />\n';
	});		
	//display in a popup
	var ip = utils.id('info_panel');
	var ip_head = ip.select('h5')
		.attr()
		.style({'color': state_color(state_name)})
		.text(state_name);
	var ip_body = ip.select('.txt')
		.attr()
		.style()
		.text(info_text);
	var close_button = ip.select('.close_button').on({
		click: function() {
			utils.hide(ip);		
		}
	});
	utils.show(ip);
}

/*mainline execution*/
/*draw map data*/
var render_loop = function() {
	draw_map();
	//draw_details(border_layer, i_states, null);
	draw_details();
	draw_gui();
}

/*perform logic calculations for next redraw*/
var logic_loop = function() {
	//console.log(l_states.find('Eire'));
	
}

/*wait for user input, process events in realtime*/
var input_loop = function() {
	/*enable direct input queue*/
	map_event_handler();
	/*enable indirect input queue while processing or exit*/
	
}

var mainline = function(options) {
	//while(prog_state == RUN_STATE.CONTINUE)
	try { 
		init();
	} catch (ex) {
		console.error(ex);
		document.write('Program cannot initialize. \n <a href="https://github.com/i1abnrk/i1abnrk.github.io/issues/">You may report the error.</a>');
	}
		initialized = true;
		//display client view
		render_loop();
		//register event-listener controllers
		input_loop();
		//after end_turn: update data model
		logic_loop();
	//}
	//window.exit(prog_state);
}

var app = function(options) { mainline(options); }

app();

module.exports.app=function(options) {return this.app(options);}
