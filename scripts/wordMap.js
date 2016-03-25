(function(){

  String.prototype.isUpperCase = function() {
      return this.valueOf().toUpperCase() === this.valueOf();
  };

  var engine = (function(){
    var wordArr = [];  
    var wordMap = new Map();
    var wordObj = {name:"wordMap", children:[]};
    var sWidth = 1024;  //960x480, 1024x512, 1024x682
    var sHeight = 682;
    var totalWord;

    var minFontSize = 7;
    var maxFontSize = 77;
    var fontSizeRange = maxFontSize - minFontSize;
    //
    var minCount = 1;
    var maxCount;
    var countRange;
    //
    var minWeight = 1;
    var maxWeight = 9;
    var weightRange = maxWeight - minWeight;

    var margin = 10;

    //-- init
    // function init(id){
    //   // myTip = new sstooltip("myTip");
    // }

    //-- loadData
    function loadData(dataFile){
      var textArr = [];
      $.getJSON(dataFile, function(jsonData) {
          var dataLength = jsonData.length;
          var joinedText = '';
          var textStr = '';
          for (var i = 0; i<dataLength; i++) {
            textStr = jsonData[i]["text"];
            //-- if retweeted
            if (textStr.substr(0, 2) == "RT") {
              var colonIndex = textStr.indexOf(":");
              textStr = textStr.substr(colonIndex + 2); //-- remove the initial "RT @username: "
            }
            textArr.push(textStr);
          }//for

          joinedText = textArr.join(" ");
          wordArr = joinedText.split(/[\s(,&-)!]+/);
          var wordIndex = 0;
          while (wordIndex < wordArr.length) {
            var word = wordArr[wordIndex];
            var wordLength = word.length;
            if ((word.substr(0, 4).toLowerCase() == "http")||(word == "-") || (word =='”')) {
              wordArr.splice(wordIndex, 1);
            } else {
              if ((wordLength > 1) && !word.isUpperCase()) {
                wordArr[wordIndex] = word.substr(0,1).toLowerCase() + word.substr(1);
              }
              wordIndex++;
            }
          }//while

          joinedText = wordArr.join(" ");
          wordArr = joinedText.split(/[\s.:-?"—”]+/);
          var wordArrLength = wordArr.length;
          totalWord = wordArrLength;
          // console.log("INFO wordArr:  wordArr.length is " + wordArrLength);
          // console.log(wordArr);
          var childrenArr = [];
          maxCount = 1;
          for (var j=0; j<wordArrLength; j++) {
            // console.log(j + ": " + wordArr[j] + ", wordMap.get(wordArr[j]): " + wordMap.get(wordArr[j]));
            var name = wordArr[j];
            var childrenLength = childrenArr.length;
            var found = false;
            for (var l=0; l<childrenLength; l++) {
              if (childrenArr[l].name == name) {
                childrenArr[l].value++;
                if (childrenArr[l].value > maxCount) maxCount = childrenArr[l].value;
                found = true;
                break;
              }
            }
            if (!found) {
              childrenArr.push({name:name, value:1});
            }
          }//for

          wordObj.children = childrenArr;
          // console.log("childrenLength is " + wordObj.children.length);
          countRange = maxCount - minCount;
          visualize(wordObj);
      });
    }

    //-- visualize
    function visualize(dataObj) {
      // console.log("INFO visualize: dataObj.children.length is " + dataObj.children.length);
      // console.log("INFO visualize: maxCount is " + maxCount);
      var treemap = d3.layout.treemap()
                    .size([sWidth, sHeight])
                    .sticky(true)
                    .mode("squarify")
                    .value(function(d) {return d.value;});

      var container = d3.select("#container")
                    .style("width", sWidth + margin*2 + 2 +  "px")
                    .style("height", sHeight + margin*2 + 2 + "px");

      var wordMap = d3.select("#wordTreeMap")
                    .style("width", sWidth + "px")
                    .style("height", sHeight + "px")
                    .style("left", margin + "px")
                    .style("top", margin + "px");

      var color = d3.scale.linear()
                  .domain([0, 25])
                  .range(["white", "steelblue"])
                  .interpolate(d3.interpolateLab);

      var mousemove = function(d) {
        var xPosition = d3.event.pageX + 5;
        var yPosition = (d3.event.pageY < (sHeight + 25))? d3.event.pageY + 3 : d3.event.pageY - 45;

        d3.select("#tip")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px");
        d3.select("#tip #word")
          .text(d.name);
        d3.select("#tip #count")
          .html("<span>" + d.value + "</span> of " + totalWord + " words in 100 tweets");
        d3.select("#tip").classed("hidden", false);
      };

      var mouseout = function() {
        d3.select("#tip").classed("hidden", true);
      };

      var node = wordMap.datum(dataObj).selectAll(".node")
                .data(treemap.nodes)
                .enter().append("div")
                .attr("class", "node")
                .style("font-size", function(d) {
                  return Math.round(((d.value - minCount)*fontSizeRange)/countRange + minFontSize) + "px";
                })
                .style("font-weight", function(d) {
                  // if (d.value == 1) fontWeight = 400;
                  // if (d.value >= 2) fontWeight = 500;
                  // if (d.value >= 5) fontWeight = 600;
                  // if (d.value >= 10) fontWeight = 700;
                  // if (d.value >= 15) fontWeight = 800;
                  // if (d.value >= 20) fontWeight = 900;
                  return fontWeight = (d.value <= 1)? 400 : Math.min(Math.floor(d.value/5)*100 + 500, 900);
                })
                .style("line-height", function(d) {
                  return Math.floor(d.dy) + "px"; //nodeHeight
                })
                .style("background-color", function(d) {
                  var value = (d.value > 25)? 25 : d.value;
                  return color(value);
                })
                .call(position)
                .on("mousemove", mousemove)
                .on("mouseout", mouseout)
                .text(function(d) { return d.children ? null : d.name; });
    }

    function position() {
      this.style("left", function(d) { return d.x + "px"; })
          .style("top", function(d) { return d.y + "px"; })
          .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
          .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    }

    return {
      // init: init,
      loadData: loadData,
      visualize: visualize
    };
  }());

  //-- Run!
  // engine.init("wordMap");  //CHECK, need?
  // engine.loadData("data/test.json");
  engine.loadData("http://www.whoin.net/tweetTweetCalls/getTweets.php");

}()); //!function(){}(); == (function(){})() = (function(){}());
