/*gdata.js*/

var Nations_init = {

};

var States_init = [
	{	name: 'Eire',
		shape: [233, 456, 235, 385, 305, 284, 412, 261, 439, 297, 448, 345, 380, 449, 291, 463, 291, 463],
		ppl: 5500,
		soldiers: 400,
		fields: 300,
		neighbors: ['Picti','Cardiff']
	},
	{	name: 'Picti',
		shape : [424, 244, 430, 153, 489, 103, 618, 105, 605, 217, 575, 328, 457, 339],
		ppl: 6000,
		soldiers: 350,
		fields: 140,
		neighbors: ['Eire','Cardiff','York', 'Oslo']
	},
	{	name: 'York',
		shape: [487, 339, 576, 331, 606, 404, 604, 463, 507, 498],
		ppl: 8400,
		soldiers: 1200,
		fields: 600,
		neighbors: ['Cardiff', 'Kent', 'London', 'Picti']
	},
	{	name: 'Cardiff',
		shape: [454, 346, 481, 343, 510, 539, 427, 591, 325, 575],
		ppl: 2600,
		soldiers: 440,
		fields: 220,
		neighbors: ['Eire', 'York', 'London', 'Brest']
	},
	{	name: 'London', 
		shape: [601, 555, 511, 534, 507, 501, 603, 464, 637, 477, 637, 517],
		ppl: 6500,
		soldiers: 600,
		fields: 840,
		neighbors: ['Cardiff', 'York', 'Kent']
	},
	{	name: 'Kent', 
		shape: [470, 568, 511, 539, 604, 555, 616, 573, 504, 594],
		ppl: 1800,
		fields: 240,
		soldiers: 300,
		neighbors: ['Brux', 'Cardiff', 'London']
	},
	{	name: 'Brest',
		shape: [364, 640, 469, 655, 451, 719, 403, 746, 352, 688],
		ppl: 2500,
		fields: 320,
		soldiers: 330,
		neighbors: ['Cardiff', 'Orleans', 'Borges']
	},
	{	name: 'Orleans',
		shape: [453, 618, 543, 630, 616, 765, 514, 770, 429, 751, 451, 720, 468, 655],
		ppl: 3800,
		fields: 500,
		soldiers: 410,
		neighbors: ['Brest', 'Paris', 'Borges']
	},
	{	name: 'Paris',
		shape: [551, 642, 606, 624, 713, 663, 733, 758, 630, 792],
		ppl: 5000,
		soldiers: 3300,
		fields: 390,
		neighbors: ['Orleans', 'Brux', 'Koln', 'Geneva']
	},
	{	name: 'Brux',
		shape: [608, 622, 614, 577, 708, 585, 758, 564, 778, 595, 712, 662],
		ppl: 2400,
		fields: 260,
		soldiers: 180,
		neighbors: ['Kent', 'Friesland', 'Koln', 'Paris']
	},
	{	name: 'Borges',
		shape: [433, 759, 472, 873, 640, 853, 629, 792, 614, 767, 513, 770],
		ppl: 6800,
		soldiers: 930,
		fields: 650,
		neighbors: ['Brest', 'Orleans', 'Paris', 'Leon', 'Narbon', 'Bordo']
	},
	{	name: 'Bordo',
		shape: [447, 838, 561, 972, 516, 1034, 408, 963],
		ppl: 5200,
		fields: 620,
		soldiers: 450,
		neighbors: ['Borges', 'Narbon', 'Barca']
	},
	{	name: 'Narbon',
		shape: [642, 858, 655, 1002, 593, 1012, 586, 1052, 519, 1034, 561, 972, 478, 872],
		ppl: 3700,
		soldiers: 350,
		fields: 420,
		neighbors: ['Borges', 'Leon', 'Marseille', 'Barca']
	},
	{	name: 'Geneva',
		shape: [626, 792, 734, 758, 773, 780, 821, 873, 756, 900, 678, 853],
		ppl: 3400,
		soldiers: 520,
		fields: 380,
		neighbors: ['Paris', 'Koln', 'Zurich', 'Milano', 'Leon']
	},
	{	name: 'Leon',
		shape: [653, 961, 754, 903, 627, 795],
		ppl: 3600,
		soldiers: 480,
		fields: 490,
		neighbors: ['Borges', 'Geneva', 'Marseille', 'Narbon']
	},
	{	name: 'Marseille',
		shape: [722, 1041, 777, 1005, 753, 904, 652, 961, 657, 1004, 684, 1033],
		ppl: 5300,
		soldiers: 633,
		fields: 480,
		neighbors: ['Leon', 'Milano', 'Genoa', 'Sardine', 'Narbon']
	},
	{	name: 'Friesland',
		shape: [677, 580, 747, 474, 862, 470, 868, 500, 818, 494, 804, 557, 757, 563, 707, 585],
		ppl: 4200,
		soldiers: 290,
		fields: 630,
		neighbors: ['Brux', 'Frankfort', 'Koln']
	},
	{	name: 'Koln',
		shape: [802, 558, 826, 611, 820, 666, 774, 778, 735, 756, 713, 664, 781, 594, 757, 560],
		ppl: 6200,
		soldiers: 780,
		fields: 1900,
		neighbors: ['Friesland', 'Frankfort', 'Mayn', 'Geneva', 'Paris', 'Brux']
	},
	{	name: 'Frankfort',
		shape: [863, 469, 898, 489, 909, 514, 926, 562, 921, 588, 826, 614, 805, 559, 818, 495, 870, 502],
		ppl: 5600,
		neighbors: ['Friesland', 'Koln', 'Hamburg', 'Mayn'],
		soldiers: 580,
		fields: 390
	},
	{	name: 'Hamburg',
		shape: [864, 465, 867, 390, 915, 393, 965, 464, 988, 581, 919, 588, 926, 561, 897, 490],
		ppl: 3700,
		soldiers: 400,
		fields: 240,
		neighbors: ['Copenhagen', 'Koln', 'Berlin', 'Mayn', 'Munchen', 'Frankfort']
	},
	{	name: 'Copenhagen',
		shape: [867, 390, 876, 272, 959, 251, 1156, 289, 1135, 364, 1047, 401, 968, 465, 915, 392],
		ppl: 2400,
		soldiers: 310,
		fields: 300,
		neighbors: ['Hamburg', 'Oslo', 'Stockholm']
	},
	{	name: 'Oslo',
		shape: [817, 125, 870, 94, 975, 68, 989, 133, 980, 178, 887, 237, 850, 231, 815, 194],
		ppl: 2800,
		soldiers: 430,
		fields: 380,
		neighbors: ['Picti', 'Stockholm', 'Copenhagen']
	},
	{	name: 'Stockholm',
		shape: [988, 255, 979, 175, 991, 133, 1099, 180, 1186, 184, 1135, 284],
		ppl: 3100,
		soldiers: 420,
		fields: 360,
		neighbors: ['Oslo', 'Copenhagen', 'Riga']
	},
	{	name: 'Mayn',
		shape: [826, 616, 921, 588, 967, 585, 951, 686, 930, 755, 773, 780, 820, 665],
		ppl: 4500,
		soldiers: 460,
		fields: 580,
		neighbors: ['Koln', 'Frankfort','Hamburg','Munchen','Zurich']
	},
	{	name: 'Zurich',
		shape: [775, 781, 931, 755, 930, 806, 889, 870, 821, 873],
		ppl: 3200,
		soldiers: 530,
		fields: 420,
		neighbors: ['Mayn', 'Munchen', 'Ravenna', 'Milano', 'Geneva']
	},
	{	name: 'Barca',
		shape: [589, 1054, 588, 1094, 487, 1129, 419, 1196, 440, 1238, 312, 1162, 366, 1096, 406, 962, 518, 1035],
		ppl: 8700,
		soldiers: 800,
		fields: 760,
		neighbors: ['Bordo', 'Narbon', 'Balaerica', 'Cordoba', 'Toled', 'Gallicia']
	},
	{	name: 'Gallicia',
		shape: [108, 998, 363, 1096, 406, 962, 171, 859, 114, 890],
		ppl: 3600,
		soldiers: 270,
		fields: 450,
		neighbors: ['Barca', 'Toled', 'Lisboa']
	},
	{	name: 'Lisboa',
		shape: [108, 998, 182, 1029, 109, 1172, 100, 1227, 32, 1212, 45, 1096],
		ppl: 4800,
		soldiers: 350,
		fields: 350,
		neighbors: ['Gallicia','Toled','Lisboa']
	},
	{	name: 'Toled',
		shape: [181, 1028, 146, 1094, 312, 1162, 365, 1096],
		ppl: 4100,
		soldiers: 470,
		fields: 430,
		neighbors: ['Gallicia', 'Barca', 'Cordoba', 'Madrid', 'Lisboa']
	},
	{	name: 'Madrid',
		shape: [230, 1133, 191, 1219, 197, 1295, 166, 1317, 100, 1227, 109, 1171, 148, 1096],
		ppl: 3800,
		soldiers: 480,
		fields: 560,
		neighbors: ['Lisboa', 'Toled', 'Cordoba']
	},
	{	name: 'Cordoba',
		shape: [230, 1135, 309, 1161, 441, 1240, 313, 1317, 196, 1295, 190, 1221],
		ppl: 4900,
		soldiers: 490,
		fields: 650,
		neighbors: ['Toled', 'Barca', 'Madrid', 'Balaerica']
	},
	{	name: 'Genoa',
		shape: [901, 1083, 904, 1001, 868, 947, 757, 925, 776, 1005, 805, 996, 826, 981, 871, 1010, 863, 1118],
		ppl: 7800,
		soldiers: 850,
		fields: 520,
		neighbors: ['Marseille', 'Milano', 'Roma', 'Sardine']
	},
	{	name: 'Milano',
		shape: [760, 924, 752, 901, 822, 872, 890, 870, 921, 938, 904, 1001, 867, 947],
		ppl: 5100,
		soldiers: 720,
		fields: 600,
		neighbors: ['Geneva', 'Zurich', 'Ravenna', 'Marseille', 'Genoa']
	},
	{	name: 'Ravenna',
		shape: [906, 1003, 950, 1044, 1004, 1045, 952, 963, 984, 919, 1019, 973, 1092, 813, 930, 806, 891, 870, 922, 938],
		ppl: 7800,
		soldiers: 690,
		fields: 680,
		neighbors: ['Zurich', 'Munchen', 'Buda', 'Beograta', 'Roma', 'Milano']
	},
	{	name: 'Roma',
		shape: [1009, 1169, 1029, 1095, 1005, 1047, 951, 1044, 906, 1002, 901, 1081, 979, 1171],
		ppl: 38000,
		soldiers: 1500,
		fields: 1600,
		neighbors: ['Genoa', 'Ravenna', 'Napoli']
	},
	{	name: 'Napoli',
		shape: [1011, 1167, 1028, 1094, 1109, 1134, 1206, 1230, 1207, 1256, 1124, 1237, 1078, 1244, 1019, 1192],
		ppl: 12400,
		soldiers: 660,
		fields: 800,
		neighbors: ['Roma', 'Siracusa', 'Tirane']
	},
	{	name: 'Siracusa',
		shape: [1136, 1241, 1169, 1305, 1061, 1403, 952, 1367, 953, 1330, 1090, 1332, 1080, 1243],
		ppl: 6400,
		fields: 580,
		soldiers: 480,
		neighbors: ['Napoli']
	},
	{	name: 'Berlin',
		shape: [965, 466, 1028, 440, 1065, 503, 1106, 597, 1084, 690, 989, 579],
		ppl: 4500,
		soldiers: 600,
		fields: 530,
		neighbors: ['Hamburg', 'Gdansk', 'Warawa', 'Munchen']
	},
	{	name: 'Munchen',
		shape: [1083, 691, 1093, 815, 932, 808, 930, 754, 970, 585, 990, 581],
		ppl: 2600,
		soldiers: 290,
		fields: 230,
		neighbors: ['Mayn','Hamburg','Berlin', 'Wien', 'Ravenna', 'Zurich']
	},	
	{	name: 'Gdansk',
		shape: [1047, 471, 1191, 417, 1210, 495, 1266, 552, 1106, 599],
		ppl: 3400,
		fields: 410,
		soldiers: 320,
		neighbors: ['Berlin', 'Warsawa','Riga']
	},
	{	name: 'Warsawa',
		shape: [1265, 554, 1318, 615, 1303, 652, 1204, 691, 1084, 691, 1109, 600],
		ppl: 2700,
		fields: 180,
		soldiers: 260,
		neighbors: ['Berlin', 'Gdansk', 'Minsk', 'Wien', 'Praha']
	},
	{	name: 'Wien',
		shape: [1095, 813, 1253, 822, 1205, 693, 1084, 692],
		ppl: 3500,
		fields: 260,
		soldiers: 440,
		neighbors: ['Munchen', 'Warsawa', 'Buda', 'Praha']
	},
	{	name: 'Beograta',
		shape: [1072, 858, 1236, 957, 1221, 1124, 1096, 1055, 1018, 973],
		ppl: 3900,
		fields: 240,
		soldiers: 440,
		neighbors: ['Ravenna', 'Buda', 'Tirane']
	},
	{	name: 'Buda',
		shape: [1235, 953, 1271, 956, 1273, 830, 1254, 823, 1094, 813, 1071, 858],
		ppl: 3400,
		fields: 260,
		soldiers: 320,
		neighbors: ['Ravenna', 'Wein', 'Praha', 'Bucharest', 'Tirane']
	},
	{	name: 'Bucharest',
		shape: [1273, 832, 1491, 767, 1562, 890, 1334, 981, 1271, 958],
		ppl: 4700,
		fields: 380,
		soldiers: 400,
		neighbors: ['Praha', 'Kiev', 'Odessa', 'Tirane', 'Buda']
	},
	{	name: 'Odessa',
		shape: [1631, 900, 1577, 1081, 1420, 1029, 1330, 981, 1562, 890],
		ppl: 3700,
		fields: 340,
		soldiers: 290,
		neighbors: ['Bucharest', 'Sevastapol', 'Thessaly', 'Byzant']
	},
	{	name: 'Tirane',
		shape: [1222, 1127, 1250, 1243, 1370, 1234, 1330, 980, 1269, 958, 1237, 958],
		ppl: 5700,
		fields: 480,
		soldiers: 550,
		neighbors: ['Beograta', 'Buda', 'Bucharest', 'Thessaly', 'Athenai']
	},
	{	name: 'Byzant',
		shape: [1580, 1083, 1636, 1131, 1519, 1219, 1508, 1171, 1432, 1181, 1419, 1026],
		ppl: 14300,
		fields: 1080,
		soldiers: 1350,
		neighbors: ['Odessa', 'Thessaly']
	},
	{	name: 'Thessaly',
		shape: [1432, 1183, 1457, 1226, 1404, 1240, 1365, 1209, 1329, 982, 1419, 1027],
		ppl: 7200,
		fields: 600,
		soldiers: 550,
		neighbors: ['Tirane', 'Odessa', 'Byzant']
	},
	{	name: 'Athenai',
		shape: [1249, 1241, 1365, 1420, 1503, 1348, 1371, 1234],
		ppl: 5200,
		fields: 540,
		soldiers: 360,
		neighbors: ['Tirane']
	},
	{	name: 'Sevastopol',
		shape: [1878, 847, 1884, 873, 1794, 931, 1734, 881, 1690, 822, 1630, 900, 1563, 891, 1677, 759, 1953, 717, 1808, 817],
		ppl: 3500,
		fields: 220,
		soldiers: 280,
		neighbors: ['Kiev', 'Odessa']
	},
	{	name: 'Praha',
		shape: [1493, 769, 1304, 652, 1206, 694, 1255, 824, 1274, 832],
		ppl: 3000,
		fields: 250,
		soldiers: 300,
		neighbors: ['Wien', 'Warsawa', 'Minsk', 'Buda', 'Bucharest']
	},
	{	name: 'Riga',
		shape: [1201, 451, 1291, 260, 1438, 325, 1267, 555, 1209, 495],
		ppl: 3100,
		fields: 290,
		soldiers: 250,
		neighbors: ['Gdansk', 'Stockholm', 'Minsk']
	},
	{	name: 'Minsk',
		shape: [1266, 553, 1438, 324, 1495, 768, 1305, 653, 1318, 614],
		ppl: 4500,
		fields: 310,
		soldiers: 370,
		neighbors: ['Praha', 'Warsawa', 'Riga', 'Moscva', 'Kiev']
	},
	{	name: 'Sardine',
		shape: [835, 1049, 802, 1094, 774, 1198, 771, 1269, 815, 1293, 842, 1265, 850, 1165],
		ppl: 3600,
		fields: 220,
		soldiers: 280,
		neighbors: ['Marseille', 'Genoa', 'Balaerica']
	},
	{	name: 'Balaerica',
		shape: [464, 1221, 619, 1157, 634, 1220, 481, 1262],
		ppl: 1200,
		fields: 240,
		soldiers: 100,
		neighbors: ['Barca', 'Cordoba', 'Sardine']
	},
	{	name: 'Kiev',
		shape: [1953, 717, 1677, 759, 1563, 891, 1494, 767, 1484, 652, 1677, 614],
		ppl: 3400,
		fields: 450,
		soldiers: 340,
		neighbors: ['Minsk', 'Moscva', 'Bucharest', 'Sevastopol']
	},
	{	name: 'Moscva',
		shape: [1484, 651, 1677, 613, 1950, 550, 1440, 322],
		ppl: 5600,
		fields: 380,
		soldiers: 600,
		neighbors: ['Minsk', 'Kiev']
	}
];//States_init

module.exports.gdata=function(){return States_init};
