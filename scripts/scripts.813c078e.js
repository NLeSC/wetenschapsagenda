"use strict";dc.multiBarChart=function(a,b){function c(){if(void 0===j){var a=o.xUnitCount();j=o.isOrdinal()&&void 0===p?Math.floor(o.x().rangeBand()):p?Math.floor((o.xAxisLength()-(a-1)*p)/a):Math.floor(o.xAxisLength()/(1+o.barPadding())/a),(j===1/0||isNaN(j)||k>j)&&(j=k)}}function d(a){return dc.utils.safeNumber(Math.abs(o.y()(a.y+a.y0)-o.y()(a.y0)))}function e(a,b,c){var e=a.selectAll("rect.bar").data(c.values,dc.pluck("x")),g=e.enter().append("rect").attr("class","bar").attr("fill",dc.pluck("data",o.getColor)).attr("y",o.yAxisHeight()).attr("height",0);o.renderTitle()&&g.append("title").text(dc.pluck("data",o.title(c.name))),o.isOrdinal()&&e.on("click",o.onClick);var h=o.stack();if(s===m)dc.transition(e,o.transitionDuration()).attr("x",function(a){var b=o.x()(a.x);return q&&(b-=j/2),o.isOrdinal()&&void 0!==p&&(b+=p/2),dc.utils.safeNumber(b)}).attr("y",function(a){var b=o.y()(a.y+a.y0);return a.y<0&&(b-=d(a)),dc.utils.safeNumber(b)}).attr("width",j).attr("height",function(a){return d(a)}).attr("fill",dc.pluck("data",o.getColor)).select("title").text(dc.pluck("data",o.title(c.name)));else{var i=h.length,k=j/i;dc.transition(e,o.transitionDuration()).attr("x",function(a){var b=0,c=0;h.forEach(function(d){return d.name===a.layer?void(b=k*c):void c++});var d=o.x()(a.x)+b;if(q&&(d-=k/2),o.isOrdinal()&&void 0!==p){var e=p/i;d+=e/2}return dc.utils.safeNumber(d)}).attr("y",function(a){var b=o.y()(a.y);return a.y<0&&(b-=d(a)),dc.utils.safeNumber(b)}).attr("width",k).attr("height",function(a){return d(a)}).attr("fill",dc.pluck("data",o.getColor)).select("title").text(dc.pluck("data",o.title(c.name)))}o.elasticY()&&f(),dc.transition(e.exit(),o.transitionDuration()).attr("height",0).remove()}function f(){var a=o.stack();if(s===m){var b=d3.max(a,function(a){return d3.max(a.values,function(a){return a.y0+a.y})});o.y().domain([0,b])}else{var c=d3.max(a,function(a){return d3.max(a.values,function(a){return a.y})});o.y().domain([0,c])}o.y().range([o.yAxisHeight(),0]),o.yAxis(o.yAxis().scale(o.y()))}function g(){var a=o.stack(),b=a.length,c=o.chartBodyG().selectAll("rect.bar");dc.transition(c,o.transitionDuration()).attr("x",function(a){var c=j/b,d=0,e=o.stack(),f=0;e.forEach(function(b){return b.name===a.layer?void(d=c*f):void f++});var g=o.x()(a.x)+d;if(q&&(g-=c/2),o.isOrdinal()&&void 0!==p){var h=p/b;g+=h/2}return dc.utils.safeNumber(g)}).attr("width",j/b).transition().attr("y",function(a){var b=o.y()(a.y);return a.y<0&&(b-=d(a)),dc.utils.safeNumber(b)}).attr("height",function(a){return d(a)})}function h(){var a=o.chartBodyG().selectAll("rect.bar");dc.transition(a,o.transitionDuration()).attr("y",function(a){var b=o.y()(a.y0+a.y);return a.y<0&&(b-=d(a)),dc.utils.safeNumber(b)}).attr("height",function(a){var b=o.y()(a.y0)-o.y()(a.y0+a.y);return dc.utils.safeNumber(b)}).transition().attr("x",function(a){var b=o.x()(a.x);return q&&(b-=j/2),o.isOrdinal()&&void 0!==p&&(b+=p/2),dc.utils.safeNumber(b)}).attr("width",j)}function i(a,b){return function(){var c=d3.select(this),d=c.attr("fill")===a;return b?!d:d}}var j,k=1,l=2,m=0,n=1,o=dc.stackMixin(dc.coordinateGridMixin({})),p=l,q=!1,r=!1,s=m;return dc.override(o,"rescale",function(){return o._rescale(),j=void 0,o}),dc.override(o,"render",function(){return o.round()&&q&&!r&&dc.logger.warn("By default, brush rounding is disabled if bars are centered. See dc.js bar chart API documentation for details."),o._render()}),o.plotData=function(){var a=o.chartBodyG().selectAll("g.stack").data(o.data());c(),a.enter().append("g").attr("class",function(a,b){return"stack _"+b}),a.each(function(a,b){var c=d3.select(this);e(c,b,a)})},o.setGroupedMode=function(a){a===!0&&s===m?(g(),s=n):a===!1&&s===n&&(h(),s=m),o.elasticY()&&(f(),o.rescale(),o.redraw())},o.fadeDeselectedArea=function(){var a=o.chartBodyG().selectAll("rect.bar"),b=o.brush().extent();if(o.isOrdinal())o.hasFilter()?(a.classed(dc.constants.SELECTED_CLASS,function(a){return o.hasFilter(a.x)}),a.classed(dc.constants.DESELECTED_CLASS,function(a){return!o.hasFilter(a.x)})):(a.classed(dc.constants.SELECTED_CLASS,!1),a.classed(dc.constants.DESELECTED_CLASS,!1));else if(o.brushIsEmpty(b))a.classed(dc.constants.DESELECTED_CLASS,!1);else{var c=b[0],d=b[1];a.classed(dc.constants.DESELECTED_CLASS,function(a){return a.x<c||a.x>=d})}},o.centerBar=function(a){return arguments.length?(q=a,o):q},dc.override(o,"onClick",function(a){o._onClick(a.data)}),o.barPadding=function(a){return arguments.length?(o._rangeBandPadding(a),p=void 0,o):o._rangeBandPadding()},o._useOuterPadding=function(){return void 0===p},o.outerPadding=o._outerRangeBandPadding,o.gap=function(a){return arguments.length?(p=a,o):p},o.extendBrush=function(){var a=o.brush().extent();return!o.round()||q&&!r||(a[0]=a.map(o.round())[0],a[1]=a.map(o.round())[1],o.chartBodyG().select(".brush").call(o.brush().extent(a))),a},o.alwaysUseRounding=function(a){return arguments.length?(r=a,o):r},o.legendHighlight=function(a){o.isLegendableHidden(a)||o.g().selectAll("rect.bar").classed("highlight",i(a.color)).classed("fadeout",i(a.color,!0))},o.legendReset=function(){o.g().selectAll("rect.bar").classed("highlight",!1).classed("fadeout",!1)},dc.override(o,"xAxisMax",function(){var a=this._xAxisMax();if("resolution"in o.xUnits()){var b=o.xUnits().resolution;a+=b}return a}),o.anchor(a,b)},function(){function a(){clearTimeout(l),"grouped"===this.value?(b.setGroupedMode(!0),c.setGroupedMode(!0)):(b.setGroupedMode(!1),c.setGroupedMode(!1))}var b=dc.multiBarChart("#multibar_geslacht_per_leeftijd"),c=dc.multiBarChart("#multibar_gebieden_per_leeftijd"),d=dc.multiBarChart("#multibar_frequentie_per_gebied"),e=dc.pieChart("#pie_geslacht"),f=dc.pieChart("#pie_gebieden"),g=dc.rowChart("#rowchart_organisaties"),h=dc.rowChart("#rowchart_topicmodel_a"),i=dc.rowChart("#rowchart_jury_classificatie"),j=dc.rowChart("#rowchart_jury_topic"),k=dc.dataTable(".dc-data-table"),l=setTimeout(function(){d3.select("input[value='stacked']").property("checked",!0).each(a)},2e3);d3.selectAll("input").on("change",a),d3.csv("data/TopicModel.csv",function(a,l){function m(a){var b="";return b="mijzelf"===a.Namens?"mijzelf":a.NamensWie}function n(a){var b=a.trim().split(" "),c=[];return 1===b.length&&""===b[0]?c.push("Onbekend"):b.forEach(function(a){c.push(a)}),c}function o(a){return"man"===a.Geslacht}function p(a){return"vrouw"===a.Geslacht}function q(a){return function(b,c){var d=n(c.Wetenschapsvelden);return a.forEach(function(a){d.indexOf(a)>-1&&(b[a]+=1)}),b}}function r(a){return function(b,c){var d=n(c.Wetenschapsvelden);return a.forEach(function(a){d.indexOf(a)>-1&&(b[a]-=1)}),b}}function s(a){return function(){var b={};return a.forEach(function(a){b[a]=0}),b}}if(a)throw a;var t=crossfilter(l),u={Onbekend:"#b15928","Niet Geclassificeerd":"#b15928",Sociale:"#ff7f00","Sociale wetenschappen":"#ff7f00",Geestes:"#6a3d9a",Geesteswetenschappen:"#6a3d9a",Levens:"#e31a1c",Levenswetenschappen:"#e31a1c",Natuur:"#33a02c",Natuurwetenschappen:"#33a02c",Technische:"#1f78b4","Technische wetenschappen":"#1f78b4"},v=function(a){function b(a,b){a.style("fill",function(a){return u[a[b]]})}b(a.selectAll("g.stack").selectAll("rect.bar"),"layer"),b(a.selectAll("g.dc-legend-item").selectAll("rect"),"name")},w=[];for(var x in u)w.push(u[x]);var y=d3.scale.ordinal().domain(Object.keys(u)).range(w),z=function(a,b){var c=a.length,d=b.length;if(a===b)return 0;if(0===c)return d;if(0===d)return c;for(var e=new Array(d+1),f=new Array(d+1),g=0;g<e.length;g++)e[g]=g;for(var h=0;h<e.length;h++){f[0]=h+1;for(var i=0;i<b.Length;i++){var j=a[h]===b[i]?0:1;f[i+1]=Math.min(f[i]+1,e[i+1]+1,e[i]+j)}for(var k=0;k<e.Length;k++)e[k]=f[k]}},A=600,B=360,C=t.dimension(function(a){return+a.Leeftijd}),D=C.group().reduceCount().reduce(function(a,b){return o(b)?a.totalMan++:p(b)?a.totalVrouw++:a.totalGeen++,a},function(a,b){return o(b)?a.totalMan--:p(b)?a.totalVrouw--:a.totalGeen--,a},function(){return{totalMan:0,totalVrouw:0,totalGeen:0}});b.width(A).height(B).margins({top:B/10,right:A/20,bottom:20,left:A/20}).dimension(C).group(D,"vrouwen").valueAccessor(function(a){return a.value.totalVrouw}).stack(D,"mannen",function(a){return a.value.totalMan}).stack(D,"onbekend",function(a){return a.value.totalGeen}).ordinalColors(["red","blue","green"]).x(d3.scale.linear().domain([1,100])).elasticY(!0).brushOn(!0).xAxisLabel("Leeftijd").yAxisLabel("Frequentie").legend(dc.legend().x(A-75).y(B/10)).xAxis().ticks(5).tickFormat(d3.format("d")),b.render();var E=t.dimension(function(a){return+a.Leeftijd}),F=E.group().reduce(function(a,b){var c=b.Wetenschapsvelden.trim().split(" ");return c.forEach(function(b){""===b&&(b="Onbekend"),a[b]=(a[b]||0)+1}),a},function(a,b){var c=b.Wetenschapsvelden.trim().split(" ");return c.forEach(function(b){""===b&&(b="Onbekend"),a[b]=(a[b]||0)-1}),a},function(){return{Onbekend:0,Sociale:0,Geestes:0,Levens:0,Natuur:0,Technische:0}});c.width(A).height(B).margins({top:B/10,right:A/20,bottom:20,left:A/20}).dimension(E).group(F,"Onbekend").valueAccessor(function(a){return a.value.Onbekend}).stack(F,"Sociale wetenschappen",function(a){return a.value.Sociale}).stack(F,"Geesteswetenschappen",function(a){return a.value.Geestes}).stack(F,"Levenswetenschappen",function(a){return a.value.Levens}).stack(F,"Natuurwetenschappen",function(a){return a.value.Natuur}).stack(F,"Technische wetenschappen",function(a){return a.value.Technische}).x(d3.scale.linear().domain([1,100])).elasticY(!0).brushOn(!0).xAxisLabel("Leeftijd").yAxisLabel("Frequentie over Wetenschapsvelden").legend(dc.legend().x(A-175).y(B/10)).xAxis().ticks(5).tickFormat(d3.format("d")),c.on("renderlet",v),c.render();var G=t.dimension(function(a){return n(a.Wetenschapsvelden)}),H=["Onbekend","Sociale","Geestes","Levens","Natuur","Technische"],I=G.group().reduce(q(H),r(H),s(H));d.width(A).height(480).margins({top:B/10,right:A/20,bottom:150,left:A/20}).dimension(G).group(I,"Onbekend").valueAccessor(function(a){return a.value.Onbekend}).stack(I,"Sociale wetenschappen",function(a){return a.value.Sociale}).stack(I,"Geesteswetenschappen",function(a){return a.value.Geestes}).stack(I,"Levenswetenschappen",function(a){return a.value.Levens}).stack(I,"Natuurwetenschappen",function(a){return a.value.Natuur}).stack(I,"Technische wetenschappen",function(a){return a.value.Technische}).x(d3.scale.ordinal()).xUnits(dc.units.ordinal).elasticY(!0).brushOn(!0).xAxisLabel("").yAxisLabel("Frequentie").legend(dc.legend().x(A-175).y(B/10)),d.on("renderlet",function(a){a.selectAll("g.x text").style("text-anchor","end").attr("transform","rotate(-65)").attr("dy","-5").attr("dx","-10"),a.selectAll("g.x axis").attr("dx","300"),v(a)}),d.render();var J=t.dimension(function(a){var b="";return b=""===a.Geslacht?"mijzelf"===a.Namens?"Onbekend":"Organisaties":a.Geslacht}),K=J.group();e.width(200).height(200).colors(d3.scale.ordinal().domain(["man","vrouw","Onbekend","Organisaties"]).range(["blue","red","green","orange"])).colorAccessor(function(a){return a.key}).dimension(J).group(K),e.render();var L=t.dimension(function(a){return n(a.Wetenschapsvelden)}),M=L.groupAll().reduce(q(H),r(H),s(H)),N={all:function(){var a=M.value(),b=[];for(var c in a)b.push({key:c,value:a[c]});return b}};f.width(200).height(200).dimension(L).group(N).filterHandler(function(a,b){return a.filterFunction(function(a){var c=!0;return b.forEach(function(b){c===!0&&-1===a.indexOf(b)&&(c=!1)}),c}),b}).colors(function(a){return y(a)}),f.render();var O=t.dimension(function(a){return m(a)}),P=O.group();g.x(d3.scale.log().domain([1,1e4]).range([0,600]).nice()).data(function(a){return a.order(function(a){return a}).top(20)}).ordering(function(a){return-a}).width(600).height(400).elasticX(!1).dimension(O).group(P),g.xAxis().tickFormat(function(a){return 5>=a?d3.format("1d"):10===a||50===a?d3.format("2d"):100===a||500===a?d3.format("3d"):1e3===a||5e3===a?d3.format("4d"):1e4===a?d3.format("5d"):a="",a}),g.render();var Q=t.dimension(function(a){var b=a.Topic1;return b});Q.filter(function(a){return""!==a.Topic1});var R=Q.group(),S={"":[],Natuurkunde:["aarde","deeltje","materie","ruimte","bestaan","tijd","heelal","ecosysteem","ontstaan","licht"],Informatica:["data","informatie","digitaal","gegeven","privacy","gebruiken","integraal","hoeveelheid","computer","machine"],Psychologie:["mens","factor","gezond","herseen","gedrag","invloed","klacht","genetisch","omgeving","leven","onzekerheid","therapie","prof","patroon","verandering","nauwkeurig","tegengaan","oorspronkelijk","verschuiving","racisme"],Gezondheid:["thees","disorder","treatment","human","diseas","life","serious","privé","netherlands","moor","medicijn","medicatie","lyme","zwangerschap","test","operatie","noordzee","krijgen","afweersysteem","moeder","bewustzijn","health","helft","still","amsterdam","disease","veehouderij","plicht","uitbarsting"],Genetica:["dna","patient","erfelijk","opgroeien","experiment","tool","familie","system"],Watermanagement:["water","opnieuw","zeeland","regio","rivier","delta","mooi","boom","landschap","fase"],Zintuigen:["zien","beeld","lezen","schrijven","kijken","spreken","horen","vaak","softwaar","gedragen"],"Media&Cultuur":["publiek","cultureel","sociaal","verleden","geschiedenis","politiek","eeuw","vorm","media","rol"],"Wetenschap&Bedrijfsleven":["komen","wetenschap","stand","vraag","gebouw","aantal","bedrijfsleven","commissie","groot","future"],Vernieuwing:["nieuw","steeds","ontwikkeling","nodig","groot","kennis","proces","mogelijkheid","mens","technologie"],"Groene Energie":["energie","lucht","levert","mogelijk","inrichting","slaan","oplossen","woning","belasting","cluster","duurzame","energie","duurzaam","gebruik","brandstof","elektrisch","gebruiken","water","produceren","zee"],Duurzaamheid:["financiël","gewensen","formeel","huishouden","doorbreken","flexibiliteit","emissie","dringen","energiegebruik","overleven","economie","grondstof","circulair","netwerk","hergebruik","integreren","samenwerking","model","opdrachtgever","samenhang"],Biologie:["stad","cel","natuur","leven","lichaam","moleculair","stedelijk","biodiversiteit","natuurlijk","orgaan"],"Verschil Vrouw/Man":["vrouw","man","waarom","prikkel","adhd","bijv","comfort","type","regelen","verschil"],"Kunstmatige Intelligentie":["beslissing","ïdentificeren","kwantitatief","nemen","kunstmatig","intelligentie","euro","rechter","intelligent","vroegtijdig"],Onderwijs:["onderzoek","ontwikkeling","onderwijs","samenleving","rol","maatschappelijk","vraag","vragen","groot","belang"],Wetgeving:["wet","levensduur","warmte","regelgeving","verantworen","verrichten","overheid","wetgeving","kant"],Huisvesting:["bouw","europees","internationaal","nationaal","nederlands","beheer","nationale","mensenrecht","staat","financiering"],Nederland:["taal","sport","nederlands","plant","bodem","voedsel","landbouw","wijten","volksgezondheid","goed"],Overheidbemoeienis:["interventie","bewegen","ministerie","ingrijpen","gebruiker","geweld","internet","uitvoeren","effectiviteit","verbinden"],Ontwikkeling:["kennis","vrijheid","belang","preventie","vorm","spier","persoonlijk","professioneel","slachtoffer","veroudering"],Gezondheidszorg:["systeem","patient","interactie","samenspraak","dijkgraaf","biologie","implementatie","model","groot","controleren","gezondheidszorg","talent","object","medisch","onafhankelijk","rechtsstaat","straling","gender","nodigen","uitdagennen"],Volksgezondheid:["gezondheid","sociaal","zorg","maken","samenleving","vragen","goed","mens","kwaliteit","maatschappelijk"],Infrastructuur:["infrastructuur","lokaal","component","dienst","mondiaal","constructie","oplossing","instrument","bedrijf","regionaal"],Risicomanagement:["gevolg","risico","oorzaak","voorkomen","leiden","aantal","vaak","ontstaan","effectief","groot"],Planologie:["omgeving","ontwikkeling","sector","economisch","maatschappelijk","verandering","waarde","betrekking","leefomgeving","traditioneel"],Overheid:["nederland","land","overheid","samenleving","economisch","nederlands","wereld","ongelijkheid","geld","steeds"],Materiaalwetenschap:["materiaal","nieuw","maken","chemisch","product","ontwikkelen","ontwerpen","mogelijk","productie","gebruik"],Voedselwetenschap:["stof","stakeholder","leiding","dier","schadelijk","voeding","consumptie","vis","parasiet","product"],Economie:["groei","economisch","economie","welvaart","beschouwen","handel","longziekt","agressie","geloven","alternatief"],"Medische wetenschap":["hart","vaatziekt","bacteriën","antibiotica","herstellen","schade","nier","stamcel","behandelen","grijpen"],Politiek:["burger","markt","politiek","democratie","partij","democratisch","bestuur","smart","legitimiteit","grondwater"],Pedagogie:["kind","ouder","ontwikkeling","leren","nuttig","dragen","effect","kwaad","plek","invloed"],Virologie:["virus","model","science","research","paren","populatie","ontbreken","bestrijden","onderzoeker","geluk"],Klimaat:["gebied","klimaatverandering","water","gevolg","groot","effect","milieu","extreem","soort","aarde"],Neurologie:["begrijpen","proces","complex","nieuw","eigenschap","gedrag","brein","functie","biologisch","inzicht"],"Chronische Ziekten":["ziekte","patiënt","onderzoek","behandeling","effect","aandoening","chronisch","ziekt","gezondheid","kanker"],Sterrenkunde:["big","bevinden","universum","WAAR","hiv","waarnemen","vandaan","waarneming","zon","oorlog"]},T=colorbrewer.Purples[9].concat(colorbrewer.Blues[9].concat(colorbrewer.Greens[9].concat(colorbrewer.Oranges[9].concat(colorbrewer.Reds[9].concat(colorbrewer.Greys[9])))));h.x(d3.scale.linear()).data(function(a){return a.top(20)}).ordering(function(a){return-a}).colors(d3.scale.ordinal().domain([Object.keys(S)]).range(T)).width(600).height(400).elasticX(!0).dimension(Q).group(R),h.render();var U=t.dimension(function(a){var b=a.JuryVeld;return(""===b||"0"===b)&&(b="Niet Geclassificeerd"),b}),V=U.group();i.x(d3.scale.linear()).data(function(a){return a.order(function(a){return a}).top(20)}).ordering(function(a){return-a}).width(600).height(400).elasticX(!0).dimension(U).group(V).colors(function(a){return y(a)}),i.render();var W=t.dimension(function(a){return a.JuryCategorie}),X=W.group();j.x(d3.scale.linear()).data(function(a){return a.order(function(a){return a}).top(20)}).ordering(function(a){return-a}).width(600).height(400).elasticX(!0).dimension(W).group(X),j.render();var Y=t.dimension(function(a){return a.Titel});k.size(25).width(1200).dimension(Y).group(function(a){return a}).sortBy(function(a){return a["Vraag ID"]}).order(d3.ascending).columns([{label:"Organisation",format:function(a){return m(a)}},{label:"Titel",format:function(a){var b=a.Titel.split(/[\s,]+/),c="";return b.forEach(function(b){var d=T[Object.keys(S).indexOf(a.Topic1)],e=S[a.Topic1],f=!1;e.forEach(function(a){z(b,a)<3&&(f=!0)}),c+=f?" <span style='background-color:"+d+"'>"+b+"</span>":" "+b}),c}},{label:"Inhoud",format:function(a){var b=a.Inhoud.split(/[\s,]+/),c="";return b.forEach(function(b){var d=T[Object.keys(S).indexOf(a.Topic1)],e=S[a.Topic1],f=!1;e.forEach(function(a){z(b,a)<3&&(f=!0)}),c+=f?" <span style='background-color:"+d+"'>"+b+"</span>":" "+b}),c}},"JuryCategorie","Leeftijd","Geslacht"]),k.render()})}();