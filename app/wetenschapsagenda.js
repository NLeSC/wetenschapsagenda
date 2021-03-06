/* global d3:false, dc:false, crossfilter:false, colorbrewer:false, tinycolor:false */

(function() {
  'use strict';

  var chart1 = dc.multiBarChart('#multibar_geslacht_per_leeftijd');
  var chart2 = dc.multiBarChart('#multibar_gebieden_per_leeftijd');
  var chart3 = dc.multiBarChart('#multibar_frequentie_per_gebied');

  var pie1 = dc.pieChart('#pie_geslacht');
  var pie2 = dc.pieChart('#pie_gebieden');

  var rowChart1 = dc.rowChart('#rowchart_organisaties');
  var rowChart2a = dc.rowChart('#rowchart_topicmodel_a');
  // var rowChart2b = dc.rowChart('#rowchart_topicmodel_b');
  // var rowChart2c = dc.rowChart('#rowchart_topicmodel_c');
  var rowChart3 = dc.rowChart('#rowchart_jury_classificatie');
  var rowChart4 = dc.rowChart('#rowchart_jury_topic');

  var dataTable1 = dc.dataTable('.dc-data-table');

  // var treeMapChart1 = dc.treemapChart('#treeMapChart1');

  var timeout = setTimeout(function() {
    d3.select('input[value=\'stacked\']').property('checked', true).each(change);
  }, 2000);

  function change() {
    clearTimeout(timeout);
    if (this.value === 'grouped') {
      chart1.setGroupedMode(true);
      chart2.setGroupedMode(true);
    } else {
      chart1.setGroupedMode(false);
      chart2.setGroupedMode(false);
    }
  }

  d3.selectAll('input').on('change', change);

  d3.csv('data/TopicModel.csv',
    // function(d) {
    // return {
    //   title: d.Titel,
    //   content: d.Inhoud,
    //   labels: d.Labels,
    //   agenda1: d.Onderzoeksagenda1,
    //   agenda2: d.Onderzoeksagenda2,
    //   thema: d.Thema,
    //   otherAgenda: d.AndereAgenda,
    //   expertise1: d.Expertise1,
    //   expertise2: d.Expertise2,
    //   expertiseExplanation: d.ExpertiseToelichting,
    //   conference: d.Conferentie,
    //   conferenceExplanation: d.ConferentieToelichting,
    //   fields: d.Wetenschapsvelden,
    //   from: d.Namens,
    //   fromWho: d.NamensWie,
    //   age: d.Leeftijd,
    //   sex: d.Geslacht,
    //   submitted: d.Ingediend
    // };
    // },
    function(error, rows) {
      if (error) {
        throw error;
      }

      var ndx = crossfilter(rows);

      function formatOrganisation(d) {
        var result = '';
        if (d.Namens === 'mijzelf') {
          result = 'Ingevuld door individu';
        } else {
          result = d.NamensWie;
        }
        return result;
      }

      function stringColumnToArray(column) {
        var fields = column.trim().split(' ');
        var result = [];
        if (fields.length === 1 && fields[0] === '') {
          result.push('Onbekend');
        } else {
          fields.forEach(function(field) {
            result.push(field);
          });
        }

        return result;
      }

      var fieldsColors = {
        'Onbekend'  :'#b15928', 'Niet Geclassificeerd'    :'#b15928',
        'Sociale'   :'#ff7f00', 'Sociale wetenschappen'   :'#ff7f00',
        'Geestes'   :'#6a3d9a', 'Geesteswetenschappen'    :'#6a3d9a',
        'Levens'    :'#e31a1c', 'Levenswetenschappen'     :'#e31a1c',
        'Natuur'    :'#33a02c', 'Natuurwetenschappen'     :'#33a02c',
        'Technische':'#1f78b4', 'Technische wetenschappen':'#1f78b4',
      };

      var fieldsColorRenderlet = function(_chart) {
        function setStyle(selection, keyName) {
          selection.style('fill', function(d) {
            return fieldsColors[d[keyName]];
          });
        }
        // set the fill attribute for the bars
        setStyle(_chart
          .selectAll('g.stack')
          .selectAll('rect.bar'), 'layer'
        );
        // set the fill attribute for the legend
        setStyle(_chart
          .selectAll('g.dc-legend-item')
          .selectAll('rect'), 'name'
        );
      };

      var textRenderlet = function(_chart) {
        function setStyle(selection) {
          var rects = selection.select('rect');
          var texts = selection.select('text');

          var colors = [];
          rects.each( function(){
            colors.push(d3.select(this).attr('fill'));
          });

          texts.each( function(d, i){
            d3.select(this).style('fill', function() {
              return tinycolor.mostReadable(colors[i], ['black', 'white']);
            });
          });
        }
        // set the fill attribute for the bars
        setStyle(_chart
          .selectAll('g.row'), 'layer'
        );
      };

      var fieldsColorValues = [];
      for(var key in fieldsColors) {
        fieldsColorValues.push(fieldsColors[key]);
      }

      var fieldsColorScale = d3.scale.ordinal().domain(Object.keys(fieldsColors)).range(fieldsColorValues);

      var levenschteinDistance = function(s, t) {
        var lenS = s.length;
        var lenT = t.length;

        // degenerate cases
        if (s === t) {
          return 0;
        }
        if (lenS === 0) {
          return lenT;
        }
        if (lenT === 0) {
          return lenS;
        }

        // create two work vectors of integer distances
        var v0 = new Array(lenT + 1);
        var v1 = new Array(lenT + 1);

        // initialize v0 (the previous row of distances)
        // this row is A[0][i]: edit distance for an empty s
        // the distance is just the number of characters to delete from t
        for (var n = 0; n < v0.length; n++) {
          v0[n] = n;
        }

        for (var i = 0; i < v0.length; i++) {
          // calculate v1 (current row distances) from the previous row v0

          // first element of v1 is A[i+1][0]
          //   edit distance is delete (i+1) chars from s to match empty t
          v1[0] = i + 1;

          // use formula to fill in the rest of the row
          for (var j1 = 0; j1 < t.Length; j1++) {
              var cost = (s[i] === t[j1]) ? 0 : 1;
              v1[j1 + 1] = Math.min(v1[j1] + 1, v0[j1 + 1] + 1, v0[j1] + cost);
          }

          // copy v1 (current row) to v0 (previous row) for next iteration
          for (var j2 = 0; j2 < v0.Length; j2++) {
            v0[j2] = v1[j2];
          }
        }
      };


      // var totalQuestionsByWetenschapsveldenPie = wetenschapsVeldenDimensionPie.group().reduce(reduceFieldsAdd(fields), reduceFieldsRemove(fields), reduceFieldsInitial(fields));
      // var totalQuestionsByWetenschapsveldenPie = wetenschapsVeldenDimensionPie.groupAll().reduce(reduceFieldsAdd(fields), reduceFieldsRemove(fields), reduceFieldsInitial(fields));

      // function addAll(source_group) {
      //   return {
      //     all:function () {
      //       return source_group.all().filter(function(d) {
      //         return d.key[0] != 2;
      //       });
      //     }
      //   };
      // }
      //
      // var totalQuestionsByWetenschapsveldenPie =


      var width = 600;
      var height = 360;

      var ageDimension = ndx.dimension(function(d) {
        return +d.Leeftijd;
      });

      function isMan(v) {
        return v.Geslacht === 'man';
      }

      function isVrouw(v) {
        return v.Geslacht === 'vrouw';
      }

      var totalQuestionsBySexPerAge = ageDimension.group().reduceCount()
      .reduce(
        function(p, v) {
          if (isMan(v)) {
            p.totalMan++;
          } else if (isVrouw(v)) {
            p.totalVrouw++;
          } else {
            p.totalGeen++;
          }
          return p;
        },
        function(p, v) {
          if (isMan(v)) {
            p.totalMan--;
          } else if (isVrouw(v)) {
            p.totalVrouw--;
          } else {
            p.totalGeen--;
          }
          return p;
        },
        function() {
          return {
            totalMan: 0,
            totalVrouw: 0,
            totalGeen: 0
          };
        }
      );

      chart1
        .width(width)
        .height(height)
        .margins({top: height/10, right: width/20, bottom: 20, left: width/20})
        .dimension(ageDimension)
        // .turnOnControls(true)

        .group(totalQuestionsBySexPerAge, 'vrouwen')
        .valueAccessor(function(d) {
          return d.value.totalVrouw;
        })
        .stack(totalQuestionsBySexPerAge, 'mannen', function(d) {
          return d.value.totalMan;
        })
        .stack(totalQuestionsBySexPerAge, 'onbekend', function(d) {
          return d.value.totalGeen;
        })

        .ordinalColors(['red','blue','green'])
        .x(d3.scale.linear().domain([1, 100]))
        .elasticY(true)
        .brushOn(true)
        .xAxisLabel('Leeftijd')
        .yAxisLabel('Frequentie')

        .legend(dc.legend().x(width-75).y(height/10))
        .xAxis().ticks(5).tickFormat(d3.format('d'));

      chart1.render();


      var ageDimension2 = ndx.dimension(function(d) {
        return +d.Leeftijd;
      });

      var totalQuestionsByWetenschapsveldenPerAge = ageDimension2.group().reduce(
        function(p, v) {
          var splitV = v.Wetenschapsvelden.trim().split(' ');
          splitV.forEach(function(wetenschapsVeld) {
            if (wetenschapsVeld === '') {
              wetenschapsVeld = 'Onbekend';
            }
            p[wetenschapsVeld] = (p[wetenschapsVeld] || 0) + 1;
          });
          return p;
        },
        function(p, v) {
          var splitV = v.Wetenschapsvelden.trim().split(' ');
          splitV.forEach(function(wetenschapsVeld) {
            if (wetenschapsVeld === '') {
              wetenschapsVeld = 'Onbekend';
            }
            p[wetenschapsVeld] = (p[wetenschapsVeld] || 0) - 1;
          });

          return p;
        },
        function() {
          return {
            'Onbekend': 0,
            'Sociale': 0,
            'Geestes': 0,
            'Levens': 0,
            'Natuur': 0,
            'Technische': 0
          };
        }
      );

      chart2
        .width(width)
        .height(height)
        .margins({top: height/10, right: width/20, bottom: 20, left: width/20})
        .dimension(ageDimension2)
        // .turnOnControls(true)

        .group(totalQuestionsByWetenschapsveldenPerAge, 'Onbekend')
        .valueAccessor(function(d) {
          return d.value.Onbekend;
        })
        .stack(totalQuestionsByWetenschapsveldenPerAge, 'Sociale wetenschappen', function(d) {
          return d.value.Sociale;
        })
        .stack(totalQuestionsByWetenschapsveldenPerAge, 'Geesteswetenschappen', function(d) {
          return d.value.Geestes;
        })
        .stack(totalQuestionsByWetenschapsveldenPerAge, 'Levenswetenschappen', function(d) {
          return d.value.Levens;
        })
        .stack(totalQuestionsByWetenschapsveldenPerAge, 'Natuurwetenschappen', function(d) {
          return d.value.Natuur;
        })
        .stack(totalQuestionsByWetenschapsveldenPerAge, 'Technische wetenschappen', function(d) {
          return d.value.Technische;
        })

        .x(d3.scale.linear().domain([1, 100]))
        .elasticY(true)
        .brushOn(true)
        .xAxisLabel('Leeftijd')
        .yAxisLabel('Frequentie over Wetenschapsvelden')

        .legend(dc.legend().x(width-175).y(height/10))
        .xAxis().ticks(5).tickFormat(d3.format('d'));

      chart2.on('renderlet', fieldsColorRenderlet);
      chart2.render();

      var wetenschapsVeldenDimension = ndx.dimension(function(d) {
        return stringColumnToArray(d.Wetenschapsvelden);
      });

      var fields = ['Onbekend', 'Sociale', 'Geestes', 'Levens', 'Natuur', 'Technische'];

      function reduceFieldsAdd(fields) {
        return function(p, v) {
          var velden = stringColumnToArray(v.Wetenschapsvelden);

          fields.forEach(function(f) {
            if (velden.indexOf(f) > -1) {
              p[f] += 1;
            }
          });
          return p;
        };
      }
      function reduceFieldsRemove(fields) {
        return function(p, v) {
          var velden = stringColumnToArray(v.Wetenschapsvelden);

          fields.forEach(function(f) {
            if (velden.indexOf(f) > -1) {
              p[f] -= 1;
            }
          });
          return p;
        };
      }
      function reduceFieldsInitial(fields) {
        return function() {
          var ret = {};
          fields.forEach(function(f) {
            ret[f] = 0;
          });
          return ret;
        };
      }
      var totalQuestionsByWetenschapsvelden = wetenschapsVeldenDimension.group().reduce(reduceFieldsAdd(fields), reduceFieldsRemove(fields), reduceFieldsInitial(fields));

      chart3
        .width(width)
        .height(480)
        .margins({top: height/10, right: width/20, bottom: 150, left: width/20})
        .dimension(wetenschapsVeldenDimension)

        .group(totalQuestionsByWetenschapsvelden, 'Onbekend')
        .valueAccessor(function(d) {
          return d.value.Onbekend;
        })
        .stack(totalQuestionsByWetenschapsvelden, 'Sociale wetenschappen', function(d) {
          return d.value.Sociale;
        })
        .stack(totalQuestionsByWetenschapsvelden, 'Geesteswetenschappen', function(d) {
          return d.value.Geestes;
        })
        .stack(totalQuestionsByWetenschapsvelden, 'Levenswetenschappen', function(d) {
          return d.value.Levens;
        })
        .stack(totalQuestionsByWetenschapsvelden, 'Natuurwetenschappen', function(d) {
          return d.value.Natuur;
        })
        .stack(totalQuestionsByWetenschapsvelden, 'Technische wetenschappen', function(d) {
          return d.value.Technische;
        })

        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        // .centerBar(true)

        .elasticY(true)
        .brushOn(true)
        .xAxisLabel('')
        .yAxisLabel('Frequentie')

        .legend(dc.legend().x(width-175).y(height/10));
        // .xAxis().ticks(5).tickFormat(d3.format('d'));

      chart3
        .on('renderlet', function(chart){
          chart.selectAll('g.x text')
            .style('text-anchor','end')
            .attr('transform', 'rotate(-65)')
            .attr('dy', '-5')
            .attr('dx', '-10');
          chart.selectAll('g.x axis')
            .attr('dx', '300');

          fieldsColorRenderlet(chart);
        });

      chart3.render();




      var sexDimension = ndx.dimension(function(d) {
        var result = '';
        if (d.Geslacht === '') {
          if (d.Namens === 'mijzelf') {
            result = 'Onbekend';
          } else {
            result = 'Organisaties';
          }
        } else {
          result = d.Geslacht;
        }
        return result;
      });
      var countPerSex = sexDimension.group();

      pie1
        .width(200)
        .height(200)
        .colors(d3.scale.ordinal().domain(['man','vrouw','Onbekend', 'Organisaties']).range(['blue', 'red', 'green', 'orange']))
        .colorAccessor(function(d) {
          return d.key;
        })
        .dimension(sexDimension)
        .group(countPerSex);

      pie1.render();




      var wetenschapsVeldenDimensionPie = ndx.dimension(function(d) {
        return stringColumnToArray(d.Wetenschapsvelden);
      });

      var totalQuestionsByWetenschapsveldenPie = wetenschapsVeldenDimensionPie.groupAll().reduce(reduceFieldsAdd(fields), reduceFieldsRemove(fields), reduceFieldsInitial(fields));

      var fakeTotalQuestionsByWetenschapsveldenPie = {
        all: function() {
          var hash = totalQuestionsByWetenschapsveldenPie.value();
          var result = [];
          for (var kv in hash) {
            result.push({
              key: kv,
              value: hash[kv]
            });
          }
          return result;
        }
      };

      pie2
        .width(200)
        .height(200)
        .dimension(wetenschapsVeldenDimensionPie)
        .group(fakeTotalQuestionsByWetenschapsveldenPie)
        .filterHandler(function(dimension, filter){
          dimension.filterFunction(function(d) {
            var result = true;
            filter.forEach(function(f) {
              if (result === true && d.indexOf(f) === -1) {
                result = false;
              }
            });
            return result;
          });
          // dimension.filter(filter);
          return filter; // set the actual filter value to the new value
        })
        .colors(function(d){
          return fieldsColorScale(d);
        });

      pie2.render();





      var organisationDimension = ndx.dimension(function(d) { return formatOrganisation(d); });
      var countPerOrganisation = organisationDimension.group();

      rowChart1
        .x(d3.scale.log()
          .domain([1, 10000])
          .range([0,600])
          .nice()
          // .ticks(20)
        )

        .data(function(d) {
          return d.order(function (d){return d;}).top(20);
        })
        .ordering(function(d){ return -d; })
        .width(600)
        .height(400)
        .elasticX(false)
        .dimension(organisationDimension)
        .group(countPerOrganisation);

      rowChart1
        .xAxis().tickFormat(function(s) {
          if (s <= 5) {
            d3.format('1d');
          } else if (s === 10 || s === 50) {
            d3.format('2d');
          } else if (s === 100 || s === 500) {
            d3.format('3d');
          } else if (s === 1000 || s === 5000) {
            d3.format('4d');
          } else if (s === 10000) {
            d3.format('5d');
          }  else {
            s = '';
          }
          return s;
        });

        rowChart1.on('renderlet', textRenderlet);
        rowChart1.render();

      var topic1Dimension = ndx.dimension(function(d) {
        var result = d.Topic1;
        return result;
      });
      // var topic2Dimension = ndx.dimension(function(d) {
      //   var result = d.Topic2;
      //   return result;
      // });
      // var topic3Dimension = ndx.dimension(function(d) {
      //   var result = d.Topic3;
      //   return result;
      // });
      //
      topic1Dimension.filter(function(d){
        return d.Topic1 !== '';
      });
      // topic2Dimension.filter(function(d){
      //   return d.Topic2 !== '';
      // });
      // topic3Dimension.filter(function(d){
      //   return d.Topic3 !== '';
      // });
      //
      var countPerTopic1 = topic1Dimension.group();
      // var countPerTopic2 = topic2Dimension.group();
      // var countPerTopic3 = topic3Dimension.group();

      var classificatie = {
        '':[],
        'Natuurkunde':['aarde','deeltje','materie','ruimte','bestaan','tijd','heelal','ecosysteem','ontstaan','licht'],
        'Informatica':['data','informatie','digitaal','gegeven','privacy','gebruiken','integraal','hoeveelheid','computer','machine'],
        'Psychologie':['mens','factor','gezond','herseen','gedrag','invloed','klacht','genetisch','omgeving','leven','onzekerheid','therapie','prof','patroon','verandering','nauwkeurig','tegengaan','oorspronkelijk','verschuiving','racisme'],
        'Gezondheid':['thees','disorder','treatment','human','diseas','life','serious','privé','netherlands','moor','medicijn','medicatie','lyme','zwangerschap','test','operatie','noordzee','krijgen','afweersysteem','moeder','bewustzijn','health','helft','still','amsterdam','disease','veehouderij','plicht','uitbarsting'],
        'Genetica':['dna','patient','erfelijk','opgroeien','experiment','tool','familie','system',],
        'Watermanagement':['water','opnieuw','zeeland','regio','rivier','delta','mooi','boom','landschap','fase'],
        'Zintuigen':['zien','beeld','lezen','schrijven','kijken','spreken','horen','vaak','softwaar','gedragen'],
        'Media&Cultuur':['publiek','cultureel','sociaal','verleden','geschiedenis','politiek','eeuw','vorm','media','rol'],
        'Wetenschap&Bedrijfsleven':['komen','wetenschap','stand','vraag','gebouw','aantal','bedrijfsleven','commissie','groot','future'],
        'Vernieuwing':['nieuw','steeds','ontwikkeling','nodig','groot','kennis','proces','mogelijkheid','mens','technologie'],
        'Groene Energie':['energie','lucht','levert','mogelijk','inrichting','slaan','oplossen','woning','belasting','cluster', 'duurzame','energie','duurzaam','gebruik','brandstof','elektrisch','gebruiken','water','produceren','zee'],
        'Duurzaamheid':['financiël','gewensen','formeel','huishouden','doorbreken','flexibiliteit','emissie','dringen','energiegebruik','overleven','economie','grondstof','circulair','netwerk','hergebruik','integreren','samenwerking','model','opdrachtgever','samenhang'],
        'Biologie':['stad','cel','natuur','leven','lichaam','moleculair','stedelijk','biodiversiteit','natuurlijk','orgaan'],
        'Verschil Vrouw/Man':['vrouw','man','waarom','prikkel','adhd','bijv','comfort','type','regelen','verschil'],
        'Kunstmatige Intelligentie':['beslissing','ïdentificeren','kwantitatief','nemen','kunstmatig','intelligentie','euro','rechter','intelligent','vroegtijdig'],
        'Onderwijs':['onderzoek','ontwikkeling','onderwijs','samenleving','rol','maatschappelijk','vraag','vragen','groot','belang'],
        'Wetgeving':['wet','levensduur','warmte','regelgeving','verantworen','verrichten','overheid','wetgeving','kant'],
        'Huisvesting':['bouw','europees','internationaal','nationaal','nederlands','beheer','nationale','mensenrecht','staat','financiering'],
        'Nederland':['taal','sport','nederlands','plant','bodem','voedsel','landbouw','wijten','volksgezondheid','goed'],
        'Overheidbemoeienis':['interventie','bewegen','ministerie','ingrijpen','gebruiker','geweld','internet','uitvoeren','effectiviteit','verbinden'],
        'Ontwikkeling':['kennis','vrijheid','belang','preventie','vorm','spier','persoonlijk','professioneel','slachtoffer','veroudering'],
        'Gezondheidszorg':['systeem','patient','interactie','samenspraak','dijkgraaf','biologie','implementatie','model','groot','controleren','gezondheidszorg','talent','object','medisch','onafhankelijk','rechtsstaat','straling','gender','nodigen','uitdagennen'],
        'Volksgezondheid':['gezondheid','sociaal','zorg','maken','samenleving','vragen','goed','mens','kwaliteit','maatschappelijk'],
        'Infrastructuur':['infrastructuur','lokaal','component','dienst','mondiaal','constructie','oplossing','instrument','bedrijf','regionaal'],
        'Risicomanagement':['gevolg','risico','oorzaak','voorkomen','leiden','aantal','vaak','ontstaan','effectief','groot'],
        'Planologie':['omgeving','ontwikkeling','sector','economisch','maatschappelijk','verandering','waarde','betrekking','leefomgeving','traditioneel'],
        'Overheid':['nederland','land','overheid','samenleving','economisch','nederlands','wereld','ongelijkheid','geld','steeds'],
        'Materiaalwetenschap':['materiaal','nieuw','maken','chemisch','product','ontwikkelen','ontwerpen','mogelijk','productie','gebruik'],
        'Voedselwetenschap':['stof','stakeholder','leiding','dier','schadelijk','voeding','consumptie','vis','parasiet','product'],
        'Economie':['groei','economisch','economie','welvaart','beschouwen','handel','longziekt','agressie','geloven','alternatief'],
        'Medische wetenschap':['hart','vaatziekt','bacteriën','antibiotica','herstellen','schade','nier','stamcel','behandelen','grijpen'],
        'Politiek':['burger','markt','politiek','democratie','partij','democratisch','bestuur','smart','legitimiteit','grondwater'],
        'Pedagogie':['kind','ouder','ontwikkeling','leren','nuttig','dragen','effect','kwaad','plek','invloed'],
        'Virologie':['virus','model','science','research','paren','populatie','ontbreken','bestrijden','onderzoeker','geluk'],
        'Klimaat':['gebied','klimaatverandering','water','gevolg','groot','effect','milieu','extreem','soort','aarde'],
        'Neurologie':['begrijpen','proces','complex','nieuw','eigenschap','gedrag','brein','functie','biologisch','inzicht'],
        'Chronische Ziekten':['ziekte','patiënt','onderzoek','behandeling','effect','aandoening','chronisch','ziekt','gezondheid','kanker'],
        'Sterrenkunde':['big','bevinden','universum','WAAR','hiv','waarnemen','vandaan','waarneming','zon','oorlog']
      };



      var colorRange = colorbrewer.Purples[9]
                      .concat(colorbrewer.Blues[9]
                      .concat(colorbrewer.Greens[9]
                      .concat(colorbrewer.Oranges[9]
                      .concat(colorbrewer.Reds[9]
                      .concat(colorbrewer.Greys[9])))));

      rowChart2a
        .x(d3.scale.linear())
        .data(function(d) {
          // return d.order(function (d){
            return d.top(20);
          // }).top(20);
        })
        .ordering(function(d){ return -d; })
        .colors(d3.scale.ordinal().domain([Object.keys(classificatie)]).range(colorRange))
        .width(600)
        .height(400)
        .elasticX(true)
        .dimension(topic1Dimension)
        .group(countPerTopic1);

      rowChart2a.on('renderlet', textRenderlet);
      rowChart2a.render();
      //
      // rowChart2b
      //   .x(d3.scale.linear())
      //   .data(function(d) {
      //   // return d.order(function (d){
      //   return d.top(20);
      //   // }).top(20);
      //   })
      //   .ordering(function(d){ return -d; })
      //   .colors(d3.scale.ordinal().domain([Object.keys(classificatie)]).range(colorRange))
      //   .width(600)
      //   .height(400)
      //   .elasticX(true)
      //   .dimension(topic2Dimension)
      //   .group(countPerTopic2);
      // rowChart2b.render();
      //
      // rowChart2c
      //   .x(d3.scale.linear())
      //   .data(function(d) {
      //   // return d.order(function (d){
      //   return d.top(20);
      //   // }).top(20);
      //   })
      //   .ordering(function(d){ return -d; })
      //   .colors(d3.scale.ordinal().domain([Object.keys(classificatie)]).range(colorRange))
      //   .width(600)
      //   .height(400)
      //   .elasticX(true)
      //   .dimension(topic3Dimension)
      //   .group(countPerTopic3);
      // rowChart2c.render();

      var juryFieldDimension = ndx.dimension(function(d) {
        var result = d.JuryVeld;
        if (result === '' || result === '0') {
          result = 'Niet Geclassificeerd';
        }
        return result;
      });
      var juryFieldGroup = juryFieldDimension.group();

      rowChart3
        .x(d3.scale.linear())

        .data(function(d) {
          return d.order(function (d){
            return d;
          }).top(20);
        })
        .ordering(function(d){ return -d; })
        .width(600)
        .height(400)
        .elasticX(true)
        .dimension(juryFieldDimension)
        .group(juryFieldGroup)
        .colors(function(d){
          return fieldsColorScale(d);
        });

      rowChart3.on('renderlet', textRenderlet);
      rowChart3.render();

      var juryCategoryDimension = ndx.dimension(function(d) {
        var result = d.JuryCategorie;
        if (result === '' || result === '0') {
          result = 'Niet Geclassificeerd';
        }
        return result;
      });

      var juryCategoryGroup = juryCategoryDimension.group();

      function removeUnclassified(sourceGroup) {
        function notUnclassified(d) {
          return d.key !== 'Niet Geclassificeerd';
        }
        return {
          all: function() {
            return sourceGroup.all().filter(notUnclassified);
          },
          top: function(n) {
            return sourceGroup.top(n).filter(notUnclassified);
          }
        };
      }
      var filteredJuryCategoryGroup = removeUnclassified(juryCategoryGroup);

      rowChart4
        .x(d3.scale.linear())

        .data(function(d) {
          return d.top(20);
        })
        .ordering(function(d){ return -d; })
        .width(600)
        .height(400)
        .elasticX(true)
        .dimension(juryCategoryDimension)
        .group(filteredJuryCategoryGroup);

      rowChart4.on('renderlet', textRenderlet);
      rowChart4.render();


      var idDimension = ndx.dimension(function(d) {
        return +d['Vraag ID'];
      });

      dataTable1
        .size(25)
        .width(1200)
        .dimension(idDimension)
        .group(function () {
          return '';
        })
        .sortBy(function(d){return d['Vraag ID'];})
        .order(d3.ascending)
        .columns([
          { label:'Organisatie',
            format: function(d) {
              return formatOrganisation(d);
            }
          },
          { label:'Titel',
            format: function(d) {
              var words = d.Titel.split(/[\s,]+/);
              var result = '';
              words.forEach(function(word) {
                var color = colorRange[Object.keys(classificatie).indexOf(d.Topic1)];
                var topicWords = classificatie[d.Topic1];

                var match = false;
                topicWords.forEach(function(topicWord) {
                  if (levenschteinDistance(word, topicWord) < 3) {
                    match = true;
                  }
                });

                if (match) {

                // if (topicWords.indexOf(word) > -1) {
                  result += ' <span style=\'background-color:'+color+'\'>'+word+'</span>';
                } else {
                  result += ' '+word;
                }
              });
              return result;
            }
          },
          { label:'Inhoud',
            format: function(d) {
              var words = d.Inhoud.split(/[\s,]+/);
              var result = '';
              words.forEach(function(word) {
                var color = colorRange[Object.keys(classificatie).indexOf(d.Topic1)];
                var topicWords = classificatie[d.Topic1];


                var match = false;
                topicWords.forEach(function(topicWord) {
                  if (levenschteinDistance(word, topicWord) < 3) {
                    match = true;
                  }
                });
                if (match) {

                // if (topicWords.indexOf(word) > -1) {
                  result += ' <span style=\'background-color:'+color+'\'>'+word+'</span>';
                } else {
                  result += ' '+word;
                }
              });
              return result;
            }
          },
          'JuryCategorie',
          // 'Topic1',
          // 'Topic1perc',
          // 'Topic2',
          // 'Topic2perc',
          // 'Topic3',
          // 'Topic3perc',
          'Leeftijd',
          'Geslacht'
        ]);

      dataTable1.render();






      // treeMapChart1.render();

    });


})();
