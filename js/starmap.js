const _ = require("lodash");
const SIMPROPS = require("./simproperties");
const Star = require("./star");
const Phonetics = require("./namegen");
//STARMAP constructor function. This is returned in this module...
var Starmap = function Starmap() {
  // super():
  Object.call(this);

  // Setup stuff
  this.phonetics = new Phonetics();

  //GENERATE THE ACTUAL STARMAP
  this.generateStarmap();
  this.stars[0].faction = 0;
};
Starmap.prototype = Object.create(Object.prototype);

///STARMAP GENERATION ALGORITHM
Starmap.prototype.generateStarmap = function() {
  var self = this;
  this.stars = [];
  this.links = [];

  var reject_count = 0;
  while (
    this.stars.length < SIMPROPS.NSTARS &&
    reject_count < SIMPROPS.MAX_NUMBER_OF_STAR_REJECTS
  ) {
    var newStar = new Star({ name: this.phonetics.UGenerate("Cosof") });
    //Check if star is close to another star so that we should reject it
    var dists = this.getClosestStars(newStar);
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
  for (var i = 0; i < this.stars.length; i++) {
    var cstar = this.stars[i];
    var dists = this.getClosestStars(cstar);
    for (var ii = 0; ii < SIMPROPS.MIN_LINKS_BETWEEN_STARS; ii++) {
      this.links.push({ star1: cstar, star2: dists[ii].star });
    }
  }

  //Remove duplicate links
  this.links = _.uniq(this.links, function(d) {
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

  var checkStarmap = function(star, allstars, numi, callback) {
    var new_numi = numi + 1;
    allstars.push(star);
    var linkeds = self.getLinkedStars(star);
    for (var ci in linkeds) {
      var cstar = linkeds[ci];
      if (!_.includes(allstars, cstar)) {
        checkStarmap(cstar, allstars, new_numi);
      }
    }
    if (numi === 0) {
      callback(allstars);
    }
  };

  //Verify that all stars can be reached (e.g. no isolated stars exist)
  checkStarmap(self.stars[0], [], 0, function(allstars) {
    if (allstars.length == self.stars.length) {
      console.log("Proper map!");
    } else {
      console.log("Map contains unreachable stars! Regenerating...");
      self.generateStarmap(); //Herp; do it again!
    }
  });
};

Starmap.prototype.findPathways = function(srcstar, deststar) {
  //TODO var recursive_find = function(star, )
};

//UTILITY FUNCTIONS
Starmap.prototype.getClosestStars = function(cstar) {
  var dists = _.map(_.without(this.stars, cstar), function(star) {
    return {
      star: star,
      dist:
        Math.pow(cstar.mapx - star.mapx, 2) +
        Math.pow(cstar.mapy - star.mapy, 2)
    };
  });
  dists = _.sortBy(dists, function(ditem) {
    return ditem["dist"];
  });
  return dists;
};

Starmap.prototype.getLinks = function(cstar) {
  return _.filter(this.links, function(link) {
    return link.star1.id == cstar.id || link.star2.id == cstar.id;
  });
};

Starmap.prototype.getLinkedStars = function(cstar) {
  return _.map(this.getLinks(cstar), function(link) {
    if (link.star1.id == cstar.id) {
      return link.star2;
    }
    if (link.star2.id == cstar.id) {
      return link.star1;
    }
  });
};

Starmap.prototype.getStarById = function(objid) {
  return _.find(this.stars, function(star) {
    return star.objid == objid;
  });
};

Starmap.prototype.getShortestpath = function(srcstar, deststar) {
  //http://en.wikipedia.org/wiki/A*_search_algorithm
  var closedset = [];
  var openset = [srcstar];
  var came_from = {};

  var g_score = {};
  var f_score = {};

  var getLowest = function(stars, inset) {
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

  var reconstruct_path = function(came_from, current_star) {
    var retarr = [];
    var cstar = current_star;
    var i = 99999;
    while (i > 0 && cstar !== undefined) {
      retarr.push(cstar);
      var nstar = came_from[cstar.objid];
      cstar = nstar;
      i = i - 1;
    }
    return retarr.reverse();
  };

  var dist_between = function(star1, star2) {
    return 1;
  };

  var heuristic_cost_estimate = function(star, goal) {
    return dist_between(star, goal);
  };

  g_score[srcstar.objid] = 0;
  f_score[srcstar.objid] = heuristic_cost_estimate(srcstar, deststar);

  while (openset.length > 0) {
    var current = getLowest(openset, f_score);

    if (current.objid === deststar.objid) {
      return reconstruct_path(came_from, deststar);
    }
    openset = _.filter(openset, function(sta) {
      return sta.objid != current.objid;
    });
    closedset.push(current);
    var neighbors = this.getLinkedStars(current);
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      var tentative_g_score =
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

//Return the constructor function
module.exports = Starmap;
