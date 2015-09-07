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
/*yeild to maturity per month reduces to a nice constant, right about 1.33*/
const root_ytm = pow(pow(2,13),pow(12,-1));
/*1+(5%/12) monthly yeild*/
var local_effect = 1.004166667;
/*1+(2.5%/12) monthly yeild*/
var global_effect = 1.002083333;

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
