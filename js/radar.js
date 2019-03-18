const gameState = require("./gameState");
const d3 = require("d3");
const d3tip = require("d3-tip")(d3);
const d3Scale = require("d3-scale");
const Stage = require("./stage");
const Ship = require("./ship");

class Radar extends Object {
  constructor() {
    super()

    //$("#radar").draggable(); // todo: re-enable draggable support... jquery-ui?
    this.SVG = d3.select("#radar svg");
    this.bodiestip = d3
      .tip()
      .attr("class", "d3-tip d3-tip-bodies")
      .html(function (d) {
        return d.tooltipString();
      });
    this.bodiesGroup = this.SVG.append("g").attr("class", "RADAR-BODIES");
    this.shipsGroup = this.SVG.append("g").attr("class", "RADAR-SHIPS");
    this.miscGroup = this.SVG.append("g").attr("class", "RADAR-MISC");
    this.bodiesGroup.call(this.bodiestip);
    //Setup scales
    this.radarScale = d3Scale
      .scaleLinear()
      .domain([-7000, 7000])
      .range([0, 400]);

    this.redrawRadar();
  };

  update() {
    this.redrawRadar();
  };

  redrawRadar() {
    if (gameState.player.currentstar == null || gameState.player.ship == null) {
      return;
    }

    /*
        PLANETS and JUMPGATES (BODIES)
      */
    var planets = this.bodiesGroup
      .selectAll("circle.planet")
      .data(gameState.player.currentstar.planets, d => d["id"]);

    planets
      .enter()
      .append("circle")
      .attr("class", "planet")
      .style("stroke", "white")
      .style("fill", "blue")
      .attr("cx", (d, i) => this.radarScale(d["x"]))
      .attr("cy", (d, i) => this.radarScale(d["y"]))
      .attr("r", (d, i) => 3)
      .on("mouseover", (hoveredobj, i) => this.bodiestip.show(hoveredobj))
      .on("mouseout", (hoveredobj, i) => this.bodiestip.hide(hoveredobj));

    planets.exit().remove();

    var jumpgates = this.bodiesGroup
      .selectAll("circle.jumpgate")
      .data(gameState.player.currentstar.jumpgates, function (d) {
        return d["id"];
      });

    jumpgates
      .enter()
      .append("circle")
      .attr("class", "jumpgate")
      .style("stroke", "white")
      .style("fill", "rgba(0,0,0,0)")
      .attr("cx", (d, i) => this.radarScale(d["x"]))
      .attr("cy", (d, i) => this.radarScale(d["y"]))
      .attr("r", (d, i) => 3)
      .on("mouseover", (hoveredobj, i) => this.bodiestip.show(hoveredobj))
      .on("mouseout", (hoveredobj, i) => this.bodiestip.hide(hoveredobj));

    jumpgates.exit().remove();

    /*
        SHIPS
      */
    var ships = this.shipsGroup
      .selectAll("circle.ship")
      .data(Stage.get().children.filter(x => x instanceof Ship), function (d) {
        return d["id"];
      });

    ships
      .enter()
      .append("circle")
      .attr("class", "ship")
      .style("stroke", (d, i) => d.faction.color)
      .style("fill", (d, i) => d.faction.color)
      .attr("cx", (d, i) => this.radarScale(d["x"]))
      .attr("cy", (d, i) => this.radarScale(d["y"]))
      .attr("r", (d, i) => 2);

    ships
      .attr("cx", (d, i) => this.radarScale(d["x"]))
      .attr("cy", (d, i) => this.radarScale(d["y"]));

    ships.exit().remove();

    /* 
        MISC
      */
    // star
    var misc_star = this.miscGroup
      .selectAll("circle.star")
      .data([gameState.player.currentstar], function (d) {
        return d["id"];
      });

    misc_star
      .enter()
      .append("circle")
      .attr("class", "star")
      .style("stroke", "white")
      .style("fill", "white")
      .attr("cx", (d, i) => this.radarScale(d["x"]))
      .attr("cy", (d, i) => this.radarScale(d["y"]))
      .attr("r", (d, i) => 4);

    misc_star.exit().remove();
  };
}

module.exports = Radar;