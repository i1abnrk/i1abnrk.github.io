/*mainline definitions*/
const DEFAULT_MAP_LABEL_FONT = "12pt Georgia";
const RUN_STATE = {
	CONTINUE: -1,
	EXIT_NORMAL: 0,
	EXIT_ERROR: 1,
	EXIT_CRASH: 2,
	EXIT_KILL: 3
};

var prog_state = RUN_STATE.CONTINUE;

var Turn =  function(key, values) {
	this.key.year = key.year;
	this.key.month = key.month;
	this.values.state = values.state;
	this.values.commodity = values.commodity;
	this.values.initial = values.initial;
	this.values.produced = values.produced;
	this.values.used = values.used;
	this.values.price = values.price;
}


var Commodity = function(key, value) {
	/*what it's called*/
	this.key=key;
	/*equilibrium price*/
	this.value=value;	
}

var State = function(key, values) {
	this.key = key;
	this.values.shape = values.shape;
	this.values.ppl = values.ppl;
	this.values.soldiers = values.soldiers;
	this.values.fields = values.fields;
	this.values.disasters = values.disasters;
	this.values.neighbors = values.neighbors;
	this.prototype.key = 'citystate';
	this.prototype.values.shape = [];
	this.prototype.values.ppl = 5000;
	this.prototype.values.soldiers = 300;
	this.prototype.values.fields = 100;
	this.prototype.values.disasters = [];
	this.prototype.values.neighbors = [];
}

var Nation = function(key, values) {
	this.key = key;
	this.values.states = values.states;
	this.values.colormask = values.colormask;
	this.values.demonym = values.demonym;
}

var gdata = require('./gdata.js');
var _ = require('lodash');
var loki = require('lokijs');
var db = new loki('game_data.json');
var l_states = db.addCollection('states', {indices:['key']});
var l_nations = db.addCollection('nations', {indices:['nation_id','nation_name']});
var l_comms = db.addCollection('commodities', {indices:['comm_id','comm_name','base_price']});
var l_users = db.addCollection('users', {indices:['uid','uname']});
var l_turns = db.addCollection('turns', {indices:['turn_no']});
var i_data = new gdata.gdata();
/*submodule definitions*/
console.log(i_data[0]);

var shapes = [
	["Eire", "233, 456, 235, 385, 305, 284, 412, 261, 439, 297, 448, 345, 380, 449, 291, 463, 291, 463"],
	["Picti", "424, 244, 430, 153, 489, 103, 618, 105, 605, 217, 575, 328, 457, 339"],
	["York", "487, 339, 576, 331, 606, 404, 604, 463, 507, 498"],
	["Cardiff", "454, 346, 481, 343, 510, 539, 427, 591, 325, 575"],
	["London", "601, 555, 511, 534, 507, 501, 603, 464, 637, 477, 637, 517"],
	["Kent", "470, 568, 511, 539, 604, 555, 616, 573, 504, 594"],
	["Brest","364, 640, 469, 655, 451, 719, 403, 746, 352, 688"],
	["Orleans","453, 618, 543, 630, 616, 765, 514, 770, 429, 751, 451, 720, 468, 655"],
	["Paris","551, 642, 606, 624, 713, 663, 733, 758, 630, 792"],
	["Brux","608, 622, 614, 577, 708, 585, 758, 564, 778, 595, 712, 662"],
	["Borges","433, 759, 472, 873, 640, 853, 629, 792, 614, 767, 513, 770"],
	["Bordo","447, 838, 561, 972, 516, 1034, 408, 963"],
	["Narbon","642, 858, 655, 1002, 593, 1012, 586, 1052, 519, 1034, 561, 972, 478, 872"],
	["Geneva","626, 792, 734, 758, 773, 780, 821, 873, 756, 900, 678, 853"],
	["Leon","653, 961, 754, 903, 627, 795"],
	["Marseille","722, 1041, 777, 1005, 753, 904, 652, 961, 657, 1004, 684, 1033"],
	["Friesland","677, 580, 747, 474, 862, 470, 868, 500, 818, 494, 804, 557, 757, 563, 707, 585"],
	["Koln","802, 558, 826, 611, 820, 666, 774, 778, 735, 756, 713, 664, 781, 594, 757, 560"],
	["Frankfort","863, 469, 898, 489, 909, 514, 926, 562, 921, 588, 826, 614, 805, 559, 818, 495, 870, 502"],
	["Hamburg","864, 465, 867, 390, 915, 393, 965, 464, 988, 581, 919, 588, 926, 561, 897, 490"],
	["Copenhagen","867, 390, 876, 272, 959, 251, 1156, 289, 1135, 364, 1047, 401, 968, 465, 915, 392"],
	["Oslo","817, 125, 870, 94, 975, 68, 989, 133, 980, 178, 887, 237, 850, 231, 815, 194"],
	["Stockholm","988, 255, 979, 175, 991, 133, 1099, 180, 1186, 184, 1135, 284"],
	["Mayn","826, 616, 921, 588, 967, 585, 951, 686, 930, 755, 773, 780, 820, 665"],
	["Zurich","775, 781, 931, 755, 930, 806, 889, 870, 821, 873"],
	["Barca","589, 1054, 588, 1094, 487, 1129, 419, 1196, 440, 1238, 312, 1162, 366, 1096, 406, 962, 518, 1035"],
	["Gallicia","108, 998, 363, 1096, 406, 962, 171, 859, 114, 890"],
	["Lisboa","108, 998, 182, 1029, 109, 1172, 100, 1227, 32, 1212, 45, 1096"],
	["Toled","181, 1028, 146, 1094, 312, 1162, 365, 1096"],
	["Madrid","230, 1133, 191, 1219, 197, 1295, 166, 1317, 100, 1227, 109, 1171, 148, 1096"],
	["Cordoba","230, 1135, 309, 1161, 441, 1240, 313, 1317, 196, 1295, 190, 1221"],
	["Genoa","901, 1083, 904, 1001, 868, 947, 757, 925, 776, 1005, 805, 996, 826, 981, 871, 1010, 863, 1118"],
	["Milano","760, 924, 752, 901, 822, 872, 890, 870, 921, 938, 904, 1001, 867, 947"],
	["Ravenna","906, 1003, 950, 1044, 1004, 1045, 952, 963, 984, 919, 1019, 973, 1092, 813, 930, 806, 891, 870, 922, 938"],
	["Roma","1009, 1169, 1029, 1095, 1005, 1047, 951, 1044, 906, 1002, 901, 1081, 979, 1171"],
	["Napoli","1011, 1167, 1028, 1094, 1109, 1134, 1206, 1230, 1207, 1256, 1124, 1237, 1078, 1244, 1019, 1192"],
	["Siracusa","1136, 1241, 1169, 1305, 1061, 1403, 952, 1367, 953, 1330, 1090, 1332, 1080, 1243"],
	["Berlin","965, 466, 1028, 440, 1065, 503, 1106, 597, 1084, 690, 989, 579"],
	["Munchen","1083, 691, 1093, 815, 932, 808, 930, 754, 970, 585, 990, 581"],
	["Gdansk","1047, 471, 1191, 417, 1210, 495, 1266, 552, 1106, 599"],
	["Warsawa","1265, 554, 1318, 615, 1303, 652, 1204, 691, 1084, 691, 1109, 600"],
	["Wien","1095, 813, 1253, 822, 1205, 693, 1084, 692"],
	["Beograta","1072, 858, 1236, 957, 1221, 1124, 1096, 1055, 1018, 973"],
	["Buda","1235, 953, 1271, 956, 1273, 830, 1254, 823, 1094, 813, 1071, 858"],
	["Bucharest","1273, 832, 1491, 767, 1562, 890, 1334, 981, 1271, 958"],
	["Odessa","1631, 900, 1577, 1081, 1420, 1029, 1330, 981, 1562, 890"],
	["Tirane","1222, 1127, 1250, 1243, 1370, 1234, 1330, 980, 1269, 958, 1237, 958"],
	["Byzant","1580, 1083, 1636, 1131, 1519, 1219, 1508, 1171, 1432, 1181, 1419, 1026"],
	["Thessaly","1432, 1183, 1457, 1226, 1404, 1240, 1365, 1209, 1329, 982, 1419, 1027"],
	["Athenai","1249, 1241, 1365, 1420, 1503, 1348, 1371, 1234"],
	["Sevastopol","1878, 847, 1884, 873, 1794, 931, 1734, 881, 1690, 822, 1630, 900, 1563, 891, 1677, 759, 1953, 717, 1808, 817"],
	["Praha","1493, 769, 1304, 652, 1206, 694, 1255, 824, 1274, 832"],
	["Riga","1201, 451, 1291, 260, 1438, 325, 1267, 555, 1209, 495"],
	["Minsk","1266, 553, 1438, 324, 1495, 768, 1305, 653, 1318, 614"],
	["Sardine","835, 1049, 802, 1094, 774, 1198, 771, 1269, 815, 1293, 842, 1265, 850, 1165"],
	["Balaerica","464, 1221, 619, 1157, 634, 1220, 481, 1262"],
	["Kiev","1953, 717, 1677, 759, 1563, 891, 1494, 767, 1484, 652, 1677, 614"],
	["Moscva","1484, 651, 1677, 613, 1950, 550, 1440, 322"]
]


/*<!--microeconomics.js (c)2015, Seven Autumns Media
Economic simulation functions for games. From SCRATCH based on ideas and testing.
For inspiration: see "Dope Wars" circa 1998, or Romance of the Three Kingdoms 
series by Kou Shibusawa for Koei Games, Japan. for similar ideas. 
My economic model is based on equilibrium yeild curve model as explained in 
*M. Piazzesi (2006) at http://web.stanford.edu/~piazzesi/nberannual.pdf with 
simplified theora by (Krugman & Ashcroft, 2014) at 
http://web.mit.edu/14.02/www/krugman/yield.pdf License: AGPL (Affero GPL).
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
			break;
		case KEYS.A:
			break;
		case KEYS.S:
			break;
		case KEYS.D:
			break;
		case KEYS.Q:
			break;
		case KEYS.E:
			break;
	}
}

/*GUI*/
var map = document.getElementById('imap');
var borders = document.getElementById('borders');
var map_label_font = DEFAULT_MAP_LABEL_FONT;
var map_layer = map.getContext('2d');
var borders_layer = borders.getContext('2d');

/*draw shapes*/
var draw_polygon = function(context, pts) {
	//console.log(pts);
	var n = 0;
	context.strokeStyle = 'blue';
	for(pt in pts) {
		var dx = pts[pt][0];
		var dy = pts[pt][1];
		if(pt == 0) {
			context.beginPath();
			context.moveTo(dx,dy);
		} else {
			context.lineTo(dx,dy);
			context.stroke();
		}
		
	}
	context.closePath();
	context.stroke();
}


/*draw title*/
var draw_title = function(context, title, where) {
	context.textAlign='center'; 
	context.fillText(title, where.x, where.y);
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
		draw_polygon(context, pts);
		var middle=[];
		middle.x = (sum_x/(comp/2));
		middle.y = (sum_y/(comp/2));
		draw_title(context, title, middle);
	}
}

var draw_map = function(context, options) {
	//console.log(countries_graph)
	//draw background
	var map_bg = new Image();
	map_bg.onload = function() {
			context.drawImage(map_bg,0,0);
	}		
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
	draw_details(borders_layer, i_data, null);
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

var mainline = function() {
	//while(prog_state == RUN_STATE.CONTINUE) {
		logic_loop();
		render_loop();
		input_loop();
	//}
	//window.exit(prog_state);
}

mainline();

module.exports.app=function(options) {return mainline(options);}
