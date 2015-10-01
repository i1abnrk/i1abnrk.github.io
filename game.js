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
        addClass : function(nodes, str) {
            // node.className.baseVal for SVG-elements
            // or
            // node.className for HTML-elements
            _.each(nodes, function(node) {
                node.className=(node.className==null)?str:_.trim(node.className + ' ' + str);
            });
            return this;
        },
        removeClass : function(nodes, str) {
            _.each(nodes, function(node) {
                node.className=(node.className==null)?'':_.trim(node.className, str);
            });
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
 *      dynamic current price.*/
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
    this.name = values.name;
    this.nation = values.nation;
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
//state, time pairs
var last_spy={};

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
        last_spy[s.name] = FIRST_TURN;
        _.each(i_commodities, function(c) {
            l_market.insert(new Turn({
                year: game_clock.year,
                month: game_clock.month,
                state: s.name,
                commodity: c.name,
                initial: utils.getRand(200/(Math.max(1, Math.log(c.price))),
                    1800/(Math.max(1, Math.log(c.price)))),
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

var nation_of_state = function(state_name) {
    var nation = null;
    for (var nation_i in l_nations.data) {
        var state_list = l_nations.data[nation_i].states;
        for(var state_i in state_list) {
            if (state_list[state_i] == state_name) {
                return nation = l_nations.data[nation_i];
            }
        }
    }

    return nation;
}

var state_color = function(state) {
    /*select color from nations where nations.states contains state.name*/
    var nation = nation_of_state(state);
    var color = nation.color;
    return color;
}

var demonym = function(state) {
    return nation_of_state(state).demonym;
}

var my_nation = function() {
    return l_player.data[0].nation;
}

var my_states = function() {
    return l_nations.find({name: my_nation()})[0].states;
}

var is_my_state = function(state_name) {
    return _.includes(my_states(), state_name);
}

var my_targets = function(state) {
    return l_states.find({name: state})[0].neighbors;
}

var all_my_neighbors = function() {
    var n_name = my_nation();
    var my_neighbors = [];
    //collect a list of all neighbor states
    _.each(my_states(), function(state) {
		my_neighbors = _.union(my_neighbors, my_targets(state));
	});
    return my_neighbors;
}

var my_neighbors_of = function(state_name) {
   var my_neighbors = my_states();
    _.each(my_neighbors, function(n) {
        if(!_.includes(my_targets(n), state_name)) {
            my_neighbors = _.without(my_neighbors, n);
        }
    });
    return my_neighbors;
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

var do_attack = function(aggressor, sent, defender) {
	if (sent <= 0) return;
	var aggressor_count = sent;
	var defender_count = l_states.soldiers;
	var win = false;
	var fail = false;
	for (var s = 1; s < sent && !win && !fail; s++) {
		var attack_dice_count = Math.min(2, sent-s);
		var attack_dice = [];
		var defense_dice_count = Math.min(3, defender_count);
		var defense_dice = [];
		
		for (var a=1; a <= attack_dice_count; a++) {
			attack_dice[a] = getRand(1,5);
		}
		for (var d=1; d <= defense_dice_count; d++) {
			defense_dice[d] = getRand(1,5);
		}
		//sort descending
		attack_dice.sort(function(a, b){return b-a});
		defense_dice.sort(function(a, b){return b-a});
		
		switch(defense_dice_count) {
			case 1:
				if(attack_dice_count==1) {
					if(attack_dice[0] <= defense_dice[0]) {
						aggressor_count -= 1;
					} else {
						defender_count -= 1;
						win = true;
					}
				} else {
					if(attack_dice[0] <= defense_dice[0]) {
						aggressor_count -= 1;
					} else {
						defender_count -= 1;
						win = true;
					}
				}
				break;
			case 2:
			case 3:
				if(attack_dice_count == 1){
					if(attack_dice[0] <= defense_dice[0]) {
						aggressor_count -= 1;
						fail = true;
					} else {
						defender_count -= 1;
					}
				} else {
					if (attack_dice[0] <= defense_dice[0]) {
						if (attack_dice[1] <= defense_dice[1]) {
							aggressor_count -= 2;
						} else {
							aggressor_count -= 1;
							defender_count -= 1;
						}
					} else {
						if(attack_dice[1] <= defense_dice[1]) {
							aggressor_count -= 1;
							defender_count -= 1;
						} else {
							defender_count -= 2;
						}
					}
				}
				break;
			default:
				break;
		}
		if (aggressor_count <= 0) return 0;
		if (defender_count <= 0) return aggressor_count;
		return -1;
	}
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
				case MODE.ATTACK:
                    if (selected_state != '') {
                        unhighlight_polygon(selected_state)
                    }
					selected_state = this.id;
                    show_attack(selected_state);
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
					case MODE.ATTACK:
                        if (selected_state != '') {
                            unhighlight_polygon(selected_state)
                        }
						selected_state = this.id.substring(lbl_pfx.length, this.id.length);
						show_attack(this.id.substring(lbl_pfx.length, this.id.length));
						break;
                }
                return;
            }
        });
		
		utils.id('info').on({
			click: function() {
                switch (game_mode) {
                    case MODE.ATTACK:
                        if(selected_state!='') {
                            utils.hide(utils.id('attack_panel'));
                        }
                        break;
                }
				game_mode = MODE.INFO;
                if(selected_state != '') {
                    show_info(selected_state);
                }
			}
		})
		
		utils.id('attack').on({
			click: function() {
                switch (game_mode) {
                    case MODE.INFO:
                        if(selected_state!='') {
                            utils.hide(utils.id('info_panel'));
                        }
                }
				game_mode = MODE.ATTACK;
                if (selected_state != '') {
                    show_attack(selected_state);
                }
			}
		});
        
        
		d3.selectAll('#nav a').on({
			click: function() {
				//clear selected class from any other nav button
				utils.removeClass(d3.selectAll('#nav a'), 'selected');
				utils.addClass(this, 'selected');
			}
		});
        
        utils.id('a_cancel').on({
            click: function() {
                utils.hide(utils.id('attack_panel'));
            }
        });
}

var draw_gui = function(context, options) {
    /*adjust viewport size to fit screen resolution.*/
    /*draw a navbar with semi-transparency.*/
    var viewport = d3.select('#viewport');
}

var append_row = function(table, data) {
    var row = table.append('tr');
    _.each(data, function(datum) {
        row.append('td').html(datum);
    });
}

var show_info = function(state_name) {
    //calculate data to display
    var info_turn = last_spy[state_name];
    var info_table = utils.id('table');
    //clear the data from last show
    info_table.html('');
    var ithead = info_table.append('thead')
            .text('last updated: '+info_turn.month+'/'+info_turn.year+'\n');
    var state_info = l_states.by('name', state_name);
    append_row(info_table, ['people', state_info.ppl]);
    append_row(info_table, ['soldiers', state_info.soldiers]);
    append_row(info_table, ['fields', state_info.fields]);
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
        append_row(info_table, [commodity.commodity, commodity.price, commodity.initial]);
    });
    //display in a popup
    var ip = utils.id('info_panel');
    var ip_head = ip.select('h5')
        .attr()
        .style({'color': state_color(state_name)})
        .text('INFO: ' + demonym(state_name) + ' of ' + state_name);
    var ip_body = ip.select('#table')
        .attr()
        .style({'color': state_color(state_name)})
        .text();
    var close_button = ip.select('.close_button').on({
        click: function() {
            utils.hide(ip);
        }
    });
    utils.show(ip);
}

var show_attack = function(state_name) {
	var ap = utils.id('attack_panel');
	var ap_head = ap.select('h5')
		.style({'color': state_color(state_name)})
		.text('ATTACK: ' + demonym(state_name) + ' of ' + state_name);
	var close_button = ap.select('.close_button').on({
		click: function() {
			utils.hide(ap);
		}
	});
    var ap_body = ap.select('#a_table');
    ap_body.html('');
    var athead = ap_body.append('thead').attr('colspan', 3).text('Can send soldiers from: ');
    var my_neighbors = my_neighbors_of(state_name);
    if (my_neighbors.length == 0) {
        append_row(ap_body, ['No neighbors of ' + state_name]);
    } else {
        _.each(my_neighbors, function(neighbor) {
            var n = l_states.by('name', neighbor);
            var textfield = '<input type=\"text\" id=\"ati_'+ neighbor +'\" />'
            append_row(ap_body, [n.name, n.soldiers, textfield]);
        });
    }
    utils.show(ap);
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
