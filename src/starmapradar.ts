import d3 from 'd3'
import d3tipFactory from 'd3-tip'
import _ from 'lodash'
import gameState from './gameState'
const d3tip = d3tipFactory(d3)
import * as d3Scale from 'd3-scale'

export class StarmapRadar {
  public SVG: any
  public startip: any
  public miscGroup: any
  public linesGroup: any
  public starsGroup: any
  public radarScale: any
  public sizeScale: any
  constructor() {
    // Setup stuff
    // $("#starmapradar").draggable(); // todo: make draggable. jquery-ui?
    this.SVG = d3.select('#starmapradar svg')
    this.startip = d3
      .tip()
      .attr('class', 'd3-tip d3-tip-star')
      .html(d => d.tooltipString())
    this.miscGroup = this.SVG.append('g').attr('class', 'STARMAPRADAR-MISC')
    this.linesGroup = this.SVG.append('g').attr('class', 'STARMAPRADAR-LINES')
    this.starsGroup = this.SVG.append('g').attr('class', 'STARMAPRADAR-STARS')
    this.starsGroup.call(this.startip)
    // Setup scales
    this.radarScale = d3Scale
      .scaleLinear()
      .domain([-10, 110])
      .range([0, 400])
    this.sizeScale = d3Scale
      .scaleLinear()
      .domain([0, 7])
      .range([1, 8])

    gameState.on('starChanged', (newValue, oldValue) => {
      this.redrawStarmapRadar()
    })

    this.redrawStarmapRadar()
  }

  public redrawStarmapRadar() {
    if (gameState.universe.starmap == null) {
      return
    }

    /*
        STARS
      */
    const stars = this.starsGroup
      .selectAll('circle.star')
      .data(gameState.universe.starmap.stars, d => d.objid)

    stars
      .enter()
      .append('circle')
      .attr('data-objid', (d, i) => d.objid)
      .attr('class', (d, i) => 'star starClass-' + d.starclass)
      .attr('cx', (d, i) => this.radarScale(d.mapx))
      .attr('cy', (d, i) => this.radarScale(d.mapy))
      .attr('r', (d, i) => this.sizeScale(d.radius))
      .on('mouseover', (hoveredstar, i) => {
        this.startip.show(hoveredstar)
        // highlight path between currentstar and hovered star
        _.each(
          gameState.universe.starmap.getShortestpath(
            gameState.player.currentstar,
            hoveredstar
          ),
          function(a, b, c) {
            if (c[b - 1] !== undefined) {
              const link1 = document.querySelector(
                `.starline[data-star1-objid="${
                  c[b].objid
                }"][data-star2-objid="${c[b - 1].objid}"]`
              )
              const link2 = document.querySelector(
                `.starline[data-star2-objid="${
                  c[b].objid
                }"][data-star1-objid="${c[b - 1].objid}"]`
              )
              if (link1) {
                link1.classList.add('starlineHighlight')
              }
              if (link2) {
                link2.classList.add('starlineHighlight')
              }
            }
          }
        )
      })
      .on('mouseout', (hoveredstar, i) => {
        this.startip.hide(hoveredstar)
        // Remove all highlights
        const links = document.querySelectorAll('.starline.starlineHighlight')
        links.forEach(link => link.classList.remove('starlineHighlight'))
      })

    stars.exit().remove()

    /*
        LINES
      */
    /* todo */
    const lines = this.linesGroup
      .selectAll('line')
      .data(
        gameState.universe.starmap.links,
        d => d.star1.objid + ',' + d.star2.objid
      )

    lines
      .enter()
      .append('line')
      .attr('class', 'starline')
      .attr('data-star1-objid', (d, i) => d.star1.objid)
      .attr('data-star2-objid', (d, i) => d.star2.objid)
      .attr('x1', (d, i) => this.radarScale(d.star1.mapx))
      .attr('y1', (d, i) => this.radarScale(d.star1.mapy))
      .attr('x2', (d, i) => this.radarScale(d.star2.mapx))
      .attr('y2', (d, i) => this.radarScale(d.star2.mapy))

    lines.exit().remove()

    /* 
        MISC
      */
    const playerStarHighlight = this.miscGroup
      .selectAll('circle.starPlayerHighlight')
      .data([gameState.player.currentstar], d => d.objid)

    playerStarHighlight
      .enter()
      .append('circle')
      .attr('class', 'starPlayerHighlight')
      .attr('cx', (d, i) => this.radarScale(d.mapx))
      .attr('cy', (d, i) => this.radarScale(d.mapy))
      .attr('r', (d, i) => '2')

    playerStarHighlight.exit().remove()
  }
}

export default StarmapRadar
