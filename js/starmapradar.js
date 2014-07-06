define('starmapradar', [], function(){
  var StarmapRadar = function StarmapRadar(){
    // super():
    Object.call(this);
    var self = this;

    // Setup stuff
    $("#starmapradar").draggable();
    this.SVG = d3.select("#starmapradar svg");
    this.miscGroup = this.SVG.append("g").attr("class", "STARMAPRADAR-MISC");
    this.linesGroup = this.SVG.append("g").attr("class", "STARMAPRADAR-LINES");
    this.starsGroup = this.SVG.append("g").attr("class", "STARMAPRADAR-STARS");
    //Setup scales
    this.radarScale = d3.scale.linear()
      .domain([-10,110])
      .range([0,400]);
    this.sizeScale = d3.scale.linear()
      .domain([0,7])
      .range([1,8]);

    var starobserver = new PathObserver(gameState, 'player.currentstar');
    starobserver.open(function(newValue, oldValue) {
      self.redrawStarmapRadar();
    });

    this.redrawStarmapRadar();
  };
  StarmapRadar.prototype = Object.create(Object.prototype);

  StarmapRadar.prototype.redrawStarmapRadar = function() {
    var self = this;
    if (gameState.universe.starmap == null) {
      return;
    }

    /*
      STARS
    */
    var stars = this.starsGroup.selectAll("circle.star")
      .data(gameState.universe.starmap.stars, function(d){return d["objid"]})

    stars.enter()
      .append("circle")
      .attr("data-objid", function(d,i){return d["objid"]})
      .attr("class", function(d,i){return "star starClass-" + d["starclass"]})
      .attr("cx", function(d,i){return self.radarScale(d["mapx"])})
      .attr("cy", function(d,i){return self.radarScale(d["mapy"])})
      .attr("r", function(d,i){return self.sizeScale(d["radius"])})
      .on("mouseover", function(hoveredstar,i){
        // highlight path between currentstar and hovered star
        _.each(starmap.getShortestpath(gameState.player.currentstar, hoveredstar), function(a, b, c){
          if (c[b-1] !== undefined) {
           $(".starline[data-star1-objid=" + c[b].objid + "][data-star2-objid=" + c[b-1].objid + "]").attr("class", "starline starlineHighlight");
           $(".starline[data-star2-objid=" + c[b].objid + "][data-star1-objid=" + c[b-1].objid + "]").attr("class", "starline starlineHighlight");
          }
        });
      })
      .on("mouseout", function(d,i){
        // Remove all highlights
        $(".starline.starlineHighlight").attr("class", "starline");
      })

    stars.exit()
      .remove();

    /*
      LINES
    */
    /* todo */
    lines = this.linesGroup.selectAll("line")
      .data(gameState.universe.starmap.links, function(d) { return d["star1"]["objid"] + "," + d["star2"]["objid"]});

    lines.enter()
      .append("line")
        .attr("class", "starline")
        .attr("data-star1-objid", function(d,i){return d["star1"]["objid"]})
        .attr("data-star2-objid", function(d,i){return d["star2"]["objid"]})
        .attr("x1", function(d,i){return self.radarScale(d["star1"]["mapx"])})
        .attr("y1", function(d,i){return self.radarScale(d["star1"]["mapy"])})
        .attr("x2", function(d,i){return self.radarScale(d["star2"]["mapx"])})
        .attr("y2", function(d,i){return self.radarScale(d["star2"]["mapy"])})

    lines.exit()
      .remove();

    /* 
      MISC
    */
    playerStarHighlight = this.miscGroup.selectAll("circle.starPlayerHighlight")
      .data([gameState.player.currentstar], function(d){return d["objid"]})

    playerStarHighlight.enter()
      .append("circle")
      .attr("class", "starPlayerHighlight")
      .attr("cx", function(d,i){return self.radarScale(d["mapx"])})
      .attr("cy", function(d,i){return self.radarScale(d["mapy"])})
      .attr("r", function(d,i){return "2"})

    playerStarHighlight.exit().remove();

    
  };
  return StarmapRadar;
});