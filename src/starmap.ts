const _ = require("lodash");
const SIMPROPS = require("./simproperties");
const Star = require("./star");
const Phonetics = require("./namegen.js").default;
//STARMAP constructor function. This is returned in this module...
class Starmap extends Object {
  constructor() {
    super();
    // Setup stuff
    this.phonetics = new Phonetics();

    //GENERATE THE ACTUAL STARMAP
    this.generateStarmap();
    this.stars[0].faction = 0;
  }

  ///STARMAP GENERATION ALGORITHM
  generateStarmap() {
    this.stars = [];
    this.links = [];

    let reject_count = 0;
    while (
      this.stars.length < SIMPROPS.NSTARS &&
      reject_count < SIMPROPS.MAX_NUMBER_OF_STAR_REJECTS
    ) {
      let newStar = new Star({ name: this.phonetics.UGenerate("Cosof") });
      //Check if star is close to another star so that we should reject it
      let dists = this.getClosestStars(newStar);
      if (
        dists.length > 0 &&
        dists[0].dist < SIMPROPS.MIN_DISTANCE_BETWEEN_STARS
      ) {
        reject_count = reject_count + 1;
        continue; //reject it!
      }
      //Finally, add the star
      this.stars.push(newStar);
    }

    //Generate links between stars. Find nearest closest stars and link them
    for (let i = 0; i < this.stars.length; i++) {
      let cstar = this.stars[i];
      let dists = this.getClosestStars(cstar);
      for (let ii = 0; ii < SIMPROPS.MIN_LINKS_BETWEEN_STARS; ii++) {
        this.links.push({ star1: cstar, star2: dists[ii].star });
      }
    }

    //Remove duplicate links
    this.links = _.uniq(this.links, function (d) {
      if (d.star1.id <= d.star2.id) {
        return d.star1.id + "|" + d.star2.id;
      } else {
        return d.star2.id + "|" + d.star1.id;
      }
    });

    // Generate jumpgates, now that we know the links
    _.each(
      this.stars,
      star => {
        star._genJumpgates(this.getLinkedStars(star));
      },
      this
    );

    const checkStarmap = (star, allstars, numi, callback) => {
      let new_numi = numi + 1;
      allstars.push(star);
      let linkeds = this.getLinkedStars(star);
      for (let ci in linkeds) {
        let cstar = linkeds[ci];
        if (!_.includes(allstars, cstar)) {
          checkStarmap(cstar, allstars, new_numi);
        }
      }
      if (numi === 0) {
        callback(allstars);
      }
    };

    //Verify that all stars can be reached (e.g. no isolated stars exist)
    checkStarmap(this.stars[0], [], 0, (allstars) => {
      if (allstars.length == this.stars.length) {
        console.log("Proper map!");
      } else {
        console.log("Map contains unreachable stars! Regenerating...");
        this.generateStarmap(); //Herp; do it again!
      }
    });
  };

  findPathways(srcstar, deststar) {
    //TODO var recursive_find = function(star, )
  };

  //UTILITY FUNCTIONS
  getClosestStars(cstar) {
    let dists = _.map(_.without(this.stars, cstar), function (star) {
      return {
        star: star,
        dist:
          Math.pow(cstar.mapx - star.mapx, 2) +
          Math.pow(cstar.mapy - star.mapy, 2)
      };
    });
    dists = _.sortBy(dists, function (ditem) {
      return ditem["dist"];
    });
    return dists;
  };

  getLinks(cstar) {
    return _.filter(this.links, function (link) {
      return link.star1.id == cstar.id || link.star2.id == cstar.id;
    });
  };

  getLinkedStars(cstar) {
    return _.map(this.getLinks(cstar), function (link) {
      if (link.star1.id == cstar.id) {
        return link.star2;
      }
      if (link.star2.id == cstar.id) {
        return link.star1;
      }
    });
  };

  getStarById(objid) {
    return _.find(this.stars, function (star) {
      return star.objid == objid;
    });
  };

  getShortestpath(srcstar, deststar) {
    //http://en.wikipedia.org/wiki/A*_search_algorithm
    const closedset = [];
    const came_from = {};
    let openset = [srcstar];

    const g_score = {};
    const f_score = {};

    const getLowest = (stars, inset) => {
      var minscore = Infinity;
      var mintile = null;
      for (var i = 0; i < stars.length; i++) {
        if (inset[stars[i].objid] < minscore) {
          minscore = inset[stars[i].objid];
          mintile = stars[i];
        }
      }
      return mintile;
    };

    const reconstruct_path = (came_from, current_star) => {
      const retarr = [];
      let cstar = current_star;
      let i = 99999;
      while (i > 0 && cstar !== undefined) {
        retarr.push(cstar);
        let nstar = came_from[cstar.objid];
        cstar = nstar;
        i = i - 1;
      }
      return retarr.reverse();
    };

    const dist_between = (star1, star2) => {
      return 1;
    };

    const heuristic_cost_estimate = (star, goal) => {
      return dist_between(star, goal);
    };

    g_score[srcstar.objid] = 0;
    f_score[srcstar.objid] = heuristic_cost_estimate(srcstar, deststar);

    while (openset.length > 0) {
      const current = getLowest(openset, f_score);

      if (current.objid === deststar.objid) {
        return reconstruct_path(came_from, deststar);
      }
      openset = _.filter(openset, function (sta) {
        return sta.objid != current.objid;
      });
      closedset.push(current);
      const neighbors = this.getLinkedStars(current);
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];
        let tentative_g_score =
          dist_between(current, neighbor) +
          (g_score[current.objid] === undefined ? 0 : g_score[current.objid]);
        if (_.includes(closedset, neighbor)) {
          if (tentative_g_score >= g_score[neighbor.objid]) {
            continue;
          }
        }

        if (
          !_.includes(openset, neighbor) ||
          tentative_g_score < g_score[neighbor.objid]
        ) {
          came_from[neighbor.objid] = current;
          g_score[neighbor.objid] = tentative_g_score;
          f_score[neighbor.objid] =
            g_score[neighbor.objid] + heuristic_cost_estimate(neighbor, deststar);
          if (!_.includes(openset, neighbor)) {
            openset.push(neighbor);
          }
        }
      }
    }
    return null; //no path found!!!
  };
}

//Return the constructor function
export default Starmap;
