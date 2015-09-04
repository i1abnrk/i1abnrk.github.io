/*mainline definitions*/
const DEFAULT_MAP_LABEL_FONT = "12pt Georgia";
const SVG_NS = 'http://www.w3.org/2000/svg';
const RUN_STATE = {
	CONTINUE: -1,
	EXIT_NORMAL: 0,
	EXIT_ERROR: 1,
	EXIT_CRASH: 2,
	EXIT_KILL: 3
};

var initialized = false;

var prog_state = RUN_STATE.CONTINUE;

var Turn =  function(values) {
	this.year = values.year;
	this.month = values.month;
	this.state = values.state;
	this.commodity = values.commodity;
	this.initial = values.initial;
	this.produced = values.produced;
	this.used = values.used;
	this.price = values.price;
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

var gdata = require('./gdata.js');
var _ = require('lodash');
var loki = require('lokijs');
var d3 = require('d3');

var db = new loki('game_data.json');
var current_turn = first_turn;
var l_states = db.addCollection('states');
var l_nations = db.addCollection('nations');
var l_commodities = db.addCollection('commodities');
var l_users = db.addCollection('users');
var l_turns = db.addCollection('turns');
var l_market = db.addCollection('market');

//initialization
var i_states, i_nations, i_commodities;

var init = function() {
	i_states = new gdata.states();
	i_nations = new gdata.nations();
	i_commodities = new gdata.commodities();
	_.forEach(i_states, function (s) {l_states.insert(new State(s))});
	_.forEach(i_nations, function (n) {l_nations.insert(new Nation(n))});
	_.forEach(i_commodities, function (c) {l_commodities.insert(new Commodity(c))});
}

//utils
var attr = function(elt, map) {
	for (entry in map) {
		elt.setAttribute(map[entry][0], map[entry][1]);
	}
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


/*submodule definitions*/
//console.log(i_data[0]);

/*<!--microeconomics.js (c)2015, Seven Autumns Media
Economic simulation functions for games. From SCRATCH based on ideas and testing.
For inspiration: see _Dope Wars_ circa 1998, or _Romance of the Three Kingdoms_ 
series by _Shibusawa, Kou_ for Koei Games, Japan. for similar ideas. 
My economic model is based on equilibrium yeild curve model as explained in 
*M. Piazzesi (2006) at http://web.stanford.edu/~piazzesi/nberannual.pdf with 
simplified theora by (Krugman & Ashcroft, 2014) at 
http://web.mit.edu/14.02/www/krugman/yield.pdf License: AGPL-3.0 (Affero GPL).
-->*/
var pow = function(x,y){ return Math.pow(x,y); }
/*Prices are a history graph*/
/*Prices in a neighbor effect our price*/
/*Buy and sell price are the same for commodities*/
var g_commodities = Array();
var g_states = Array();
var first_turn = 0;
/*yeild to maturity per month reduces to a nice constant, right about 1.33*/
const root_ytm = pow(pow(2,13),pow(12,-1));
/*1+(5%/12) monthly yeild*/
var local_effect = 1.004166667;
/*1+(2.5%/12) monthly yeild*/
var global_effect = 1.002083333;
var commodity_id = 0;
var state_id = 0;

/*get the price from history*/
var get_price = function(market, state_id, commodity_id, turn) {

	while (last_turn(market, state_id) < turn) {
		if(turn == first_turn) {
			init_market();
		}
		update_prices(market, state);
	}

	var s = get_state_id(state);
	var c = get_commodity_id(commodity);
	var t = turn;
	var price = market[s][c][t];

	return price;
}

var set_price = function(market, state_id, commodity_id, turn, flux) {
	while (last_turn(market, state_id) < turn) {
		if(turn == first_turn) {
			init_market();
		}
		update_prices(market, state_id);
	}
	var lp = get_price(market, state_id, commodity_id, turn - 1);
	market[state][commodity][turn] = lp * flux;
}

var last_turn = function(market, state_id) {
	var lt;
	lt = market[state_id][0].length;
	return lt;
}

var get_state_id = function(state) {
	return state.id;
}

var get_commodity_id = function(commodity) {
	return commodity.id;
}

var coll_by_name = function(coll) {
	var src = {
		'nations': l_nations,
		'states': l_states,
		'turns': l_turns,
		'market': l_market,
		'commodities': l_commodities,
		'users': l_users
	}

	return src[coll].data();
}
/**run function @fun over loki collection by name @coll, 
	where coll is filtered by comparison function @cmp*/
var lod_for = function(coll, cmp, fun) {
	var target = coll_by_name(coll);
	
	target = _.filter(cmp);
	for(e in c) {
		fun(e);
	}
}

/*Based on equilibrium yeild curve model as explained in 
*http://web.stanford.edu/~piazzesi/nberannual.pdf 
*example proofs at http://web.mit.edu/14.02/www/krugman/yield.pdf
*/
var update_prices = function(market, state) {
	//cardinality of the previous turn
	var lt = last_turn(market, state);
	//cardinality of commodities
    var comm_count = market[0].length;
	//cardinality of states
	var state_count = market.length;
	for (var s_t = 0; s_t < state_count; s_t++) {
		//the state instance with id==s_t
		var s_t_real = states[s_t];
		for (var c_u=0; c_u < comm_count; c_u++) {
			//the commodity instance with id==c_u
			var c_u_real = commodities[c_u];
			//get last price
			var last_price = market[s_t][c_u][lt].price;
			//get a list of pressures
			//direct
				//actual amount used last turn
				var u_last = market[s_t][c_u][lt].used;
				//actual amount produced last turn
				var p_last = market[s_t][c_u][lt].prod;
				//base price yield t-1/t-2
				//estimated amount to be used this turn
				var u_est = est_used(market, state, comm, turn);
				//estimated amount to be produced this turn
				var p_est = est_prod(market, state, comm, turn);
				//supply-side pressure, (expected this year/actual last year)
				var base_pct = (p_est-u_est)/(p_last-p_used);
				//direct disasters pressure price exponentially by 5%
				var l_emerg = pow(local_effect, local_disasters(s_t_real)) - 1;
			//indirect
				//nearby disasters pressure price exponentially by 2.5% 
				var n_emerg = pow(global_effect, nearby_disasters(s_t_real)) - 1;
				//global average
				var g_avg = global_average(c_u_real);
				//price equilibrium
				var p_eq = equilibrium_price(c_u_real);
			//calculate a random percent between direct and indirect pressures
			//market yeild to maturity, local
			var dir_pct = (base_pct + l_emerge - 1) * root_ytm;
			//Bayes estimate: nearby market plus global market vs global constants
			var ind_pct = (1 - ((g_avg/p_eq) + n_emerge - 2)) * root_ytm;
			//lesser value of local and global pressure
			var low_pct = min(dir_pct, ind_pct);
			//greater value of local and global pressure
			var high_pct = max(dir_pct, ind_pct);
			//difference of high and low
			var d_pct = high_pct - low_pct;
			//random value between high and low
			var tot_pct = low_pct + random(d_pct);
			set_price(market, s_t, c_u, lt, tot_pct);
		}
	}
}

/*estimate how much @comm was used in @state since the previous @turn*/
var est_used = function(market, state, comm, turn) {
	var ppl_i = market[state][comm][turn-1].ppl;
	var sol_i = market[state][comm][turn-1].soldiers;
	var ppl_t = market[state][comm][turn].ppl;
	var sol_t = market[state][comm][turn].soldiers;
	var prev = market[state][comm][turn-1].used;
	var est = prev + sol_t + ppl_t - sol_i - ppl_i;
	return est;
}

/*estimate how much @comm was produced in @state since previous @turn*/
var est_prod = function(market, state, comm, turn) {
	var month = turn%12;
	if (month<6 || month >10) {
		return 0;
	}
	var fields_t = market[state][comm][turn].fields;
	//amortized by month; simulates a 120 day season
	var crop = 0.0;
	switch(month) {
		case 6:
			crop = 1.0;
	    case 7:
			crop = 3.0;
		case 8:
			crop = 16.0;
		case 9:
			crop = 7.0;
		case 10:
			crop = 1.0;
	}
	est = fields_t * crop / 28.0;
	return est;
}

var get_first_turn = function() {
	return 475;
}

/*end microeconomics.js*/

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
var map_layer = document.getElementById('map_layer');
//var borders_layer_elt = document.getElementById('border_layer');
//var borders_img = document.getElementById('borders');
//var highlights = document.getElementById('highlights');
var map_label_font = DEFAULT_MAP_LABEL_FONT;
//var map_layer = map.getContext('2d');
var border_layer = document.getElementById('border_layer');
//var highlight_layer = hightlights.getContext('2d');

/*draw shapes*/
var draw_polygon = function(context, pts, options) {
	//console.log(pts);
	var p_elt=document.createElementNS(SVG_NS, 'polygon');
	p_elt.setAttribute('points', pts);
	p_elt.setAttribute('id', options.id);
	p_elt.style['fill'] = state_color(options.id);
	p_elt.style['stroke-width'] = options.lineWidth; 
	p_elt.style['stroke'] = options.strokeStyle;
	context.appendChild(p_elt);
}

var highlight_polygon = function(context, pts) {
	draw_polygon(context, pts, {lineWidth: 3, strokeStyle: 'red'});
}

var unhighlight_polygon = function(context, pts) {
	draw_polygon(context, pts, {lineWidth: 1, strokeStyle: 'blue'});
}

/*draw title*/
var draw_title = function(context, title, where) {
	var t_elt = document.createElementNS(SVG_NS, 'text');
	t_elt.style['font']=DEFAULT_MAP_LABEL_FONT; 
	t_elt.style['fill']='black';
	t_elt.setAttribute('x', where.x);
	t_elt.setAttribute('y', where.y);
	var txt=document.createTextNode(title);
	t_elt.appendChild(txt);
	context.appendChild(t_elt);
}

var draw_details = function(context, countries_graph, options) {
	context.font = map_label_font //TODO: options['map_label_font'] || DEFAULT_MAP_LABEL_FONT;
	for (citystate in countries_graph) {
		//console.log(countries_graph[citystate]);
		var title = countries_graph[citystate].name;
		var polygon = countries_graph[citystate].shape;
		var pts = Array();
		var pt;
		var sum_x = 0;
		var sum_y = 0;
		/*iterate integers*/
		for (var comp=0; comp < polygon.length; comp++) {
			/*alternate assignment of x, y until no more coords*/
			var w = parseInt(polygon[comp]);
			//console.log(w);
			if(comp%2==0) {
				sum_x += w;
				pt = Array();
				pt.push(w);
			} else { 
				sum_y += w;
				pt.push(w);
				pts.push(pt);
			}
		}
		//console.log(pts);
		//context.fillStyle=state_color(title);
		draw_polygon(context, pts, {lineWidth: 1, strokeStyle: 'blue', id: countries_graph[citystate].name});
		var middle=[];
		middle.x = (sum_x/(comp/2));
		middle.y = (sum_y/(comp/2));
		draw_title(context, title, middle);
	}
}

var draw_map = function(context, options) {
	//console.log(countries_graph)
	//draw background
	var map_bg = document.getElementById('map_layer');
	map_bg.src='./germanic_roman_486_1923.jpg';
	map_bg.alt='Germanic tribes and Rome in 486 A.D.';
	
}

var draw_gui = function(context, options) {
	/*adjust viewport size to fit screen resolution.*/
	
}

/*mainline execution*/
/*draw map data*/
var render_loop = function() {
	draw_map(map_layer, null);
	draw_details(border_layer, i_states, null);
}

/*perform logic calculations for next redraw*/
var logic_loop = function() {
	//console.log(l_states.find('Eire'));
	
}

/*wait for user input, process events in realtime*/
var input_loop = function() {
	/*enable direct input queue*/
	
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
		render_loop();
		logic_loop();
		input_loop();
	//}
	//window.exit(prog_state);
}

mainline();

module.exports.app=function(options) {return mainline(options);}
