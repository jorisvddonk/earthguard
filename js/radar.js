define('radar', [], function(){
  var Radar = function Radar(){
    // super():
    Object.call(this);

    // Setup stuff
    $("#radar").draggable();
    this.SVG = d3.select("#radar svg");
    this.bodiestip = d3.tip().attr('class', 'd3-tip d3-tip-bodies').html(function(d) { return d.tooltipString(); });
    this.bodiesGroup = this.SVG.append("g").attr("class", "RADAR-BODIES");
    this.shipsGroup = this.SVG.append("g").attr("class", "RADAR-SHIPS");
    this.miscGroup = this.SVG.append("g").attr("class", "RADAR-MISC");
    this.bodiesGroup.call(this.bodiestip);
    //Setup scales
    this.radarScale = d3.scale.linear()
      .domain([-7000,7000])
      .range([0,400]);

    this.redrawRadar();
  };
  Radar.prototype = Object.create(Object.prototype);

  Radar.prototype.update = function() {
    this.redrawRadar();
  }

  Radar.prototype.redrawRadar = function() {
    var self = this;
    if (gameState.player.currentstar == null || gameState.player.ship == null) {
      return;
    }

    /*
      PLANETS and JUMPGATES (BODIES)
    */
    var planets = this.bodiesGroup.selectAll("circle.planet")
      .data(gameState.player.currentstar.planets, function(d){return d["id"]})

    planets.enter()
      .append("circle")
      .attr("class", "planet")
      .style("stroke", "white")
      .style("fill", "blue")
      .attr("cx", function(d,i){return self.radarScale(d["x"])})
      .attr("cy", function(d,i){return self.radarScale(d["y"])})
      .attr("r", function(d,i){return 3})
      .on("mouseover", function(hoveredobj,i){
        self.bodiestip.show(hoveredobj);
      })
      .on("mouseout", function(hoveredobj,i){
        self.bodiestip.hide(hoveredobj);
      })

    planets.exit()
      .remove();

    var jumpgates = this.bodiesGroup.selectAll("circle.jumpgate")
      .data(gameState.player.currentstar.jumpgates, function(d){return d["id"]})

    jumpgates.enter()
      .append("circle")
      .attr("class", "jumpgate")
      .style("stroke", "white")
      .style("fill", "rgba(0,0,0,0)")
      .attr("cx", function(d,i){return self.radarScale(d["x"])})
      .attr("cy", function(d,i){return self.radarScale(d["y"])})
      .attr("r", function(d,i){return 3})
      .on("mouseover", function(hoveredobj,i){
        self.bodiestip.show(hoveredobj);
      })
      .on("mouseout", function(hoveredobj,i){
        self.bodiestip.hide(hoveredobj);
      })

    jumpgates.exit()
      .remove();

    /*
      SHIPS
    */
    var ships = this.shipsGroup.selectAll("circle.ship")
      .data(gameState.universe.ships, function(d){return d["id"]})

    ships.enter()
      .append("circle")
      .attr("class", "ship")
      .style("stroke", "red")
      .style("fill", "red")
      .attr("cx", function(d,i){return self.radarScale(d["x"])})
      .attr("cy", function(d,i){return self.radarScale(d["y"])})
      .attr("r", function(d,i){return 2})

    ships
      .attr("cx", function(d,i){return self.radarScale(d["x"])})
      .attr("cy", function(d,i){return self.radarScale(d["y"])})

    ships.exit()
      .remove();

    /* 
      MISC
    */
    // star
    var misc_star = this.miscGroup.selectAll("circle.star")
      .data([gameState.player.currentstar], function(d){return d["id"]})

    misc_star.enter()
      .append("circle")
      .attr("class", "star")
      .style("stroke", "white")
      .style("fill", "white")
      .attr("cx", function(d,i){return self.radarScale(d["x"])})
      .attr("cy", function(d,i){return self.radarScale(d["y"])})
      .attr("r", function(d,i){return 4})

    misc_star.exit()
      .remove();

    // my ship
    misc_myship = this.miscGroup.selectAll("circle.myship")
      .data([gameState.player.ship], function(d){return d["id"]})

    misc_myship.enter()
      .append("circle")
      .attr("class", "star")
      .style("stroke", "white")
      .style("fill", "white")
      .attr("cx", function(d,i){return self.radarScale(d["x"])})
      .attr("cy", function(d,i){return self.radarScale(d["y"])})
      .attr("r", function(d,i){return 2})

    misc_myship
      .attr("cx", function(d,i){return self.radarScale(d["x"])})
      .attr("cy", function(d,i){return self.radarScale(d["y"])})

    misc_myship.exit()
      .remove();
  };
  return Radar;
});