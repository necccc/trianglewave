var sqwidth,
largeSide,
halfLargeSide,
unitSize,
raster, mesh = [], restizeTime;

var loaded = false;


function init () {

  sqwidth = getSqSize();
  largeSide = hypotenuse(sqwidth);
  halfLargeSide = largeSide / 2;
  unitSize = new Size(sqwidth, sqwidth);
  raster = new Raster(getImg());

  raster.on('load', function() {

    raster.fitBounds(view.bounds, true);
    loaded = true;

    var startX = view.center.x - Math.ceil(view.center.x / largeSide) * largeSide;
    var next = [
      startX,
      view.center.y - Math.ceil(view.center.y / largeSide) * largeSide
    ];

    var line = 0;
    var end = false;


    while(next) {
      var res = generateSquare(next, line, mesh);
      var pre = (line % 4 == 0) ? 1 : -1;

      if (res[0] > view.size.width && res[1] > view.size.height && end == false) {

        end = line + 1
        res[0] = startX + (pre * halfLargeSide/2);
        res[1] = next[1] + halfLargeSide;
        line += 2;

      } else if (res[0] > view.size.width) {

        if (end) {
          next = false;
          break;
        }

        res[0] = startX + (pre * halfLargeSide/2);
        res[1] = next[1] + halfLargeSide;
        line += 2;

      } else {

        res[0] = next[0] + largeSide;
        res[1] = next[1]

      }

      next = res;
    }

    view.onFrame = function (e) {
      mesh.map(function (tri) {
          tri.JSCwaveProp[0] += e.delta*1.4
          tri.opacity = wavePoint.apply(null, tri.JSCwaveProp)
      })
    }

  });
}

function wavePoint (x, line, pre) {
  var l = line + Math.sin(line);
  return 0.5 * Math.pow(
    Math.sin(
      ( x + l + (pre * sqwidth/2) ) / 3
    ), 2
  ) + 0.2
}

function generateSquare (coords, line, mesh) {
  var x = coords[0],
      y = coords[1];
  var rand = [];

  if (Math.random() > 0.55) {
    rand = [0,2]
  } else {
    rand = [1,3]
  }

  var center = new Point(x-(halfLargeSide), y-(halfLargeSide))

  var triangle1 = new Path.Rectangle(center, unitSize);
  triangle1.fillColor='white';
  triangle1.removeSegment(rand[0]); // 0
  triangle1.rotate(45);
  triangle1.blendMode = 'screen'

  triangle1.opacity = wavePoint(x, line, 1)
  triangle1.JSCwaveProp = [x, line, 1]

  mesh.push(triangle1)

  var triangle2 = new Path.Rectangle(center, unitSize);
  triangle2.fillColor='white';
  triangle2.removeSegment(rand[1]); // 2
  triangle2.rotate(45);
  triangle2.blendMode = 'screen'
  triangle2.opacity = wavePoint(x, line+1, -1)
  triangle2.JSCwaveProp = [x, line+1, -1]

  mesh.push(triangle2)

  return [x+(halfLargeSide), y+(halfLargeSide)];

}

function hypotenuse (a) {
  return Math.sqrt(Math.pow(a, 2) * 2);
}

function getImg () {
  var ratio = window.devicePixelRatio &&  window.devicePixelRatio > 1 ? 2 : 1;
  var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  if (width > 1080) {
    return 'bg1080x2.jpg'
  } else if (width > 720 && ratio > 1) {
    return 'bg1080x2.jpg'
  } else if (width > 720 && ratio == 1) {
    return 'bg1080.jpg'
  } else if (ratio > 1) {
    return 'bg720x2.jpg'
  } else {
    return 'bg720.jpg'
  }
}

function getSqSize () {
  return 64;
}

function remove (item) {
  item.remove();
  item = null;
  return null;
}

function reset () {
  view.onFrame = function () {}
  raster.remove();
  mesh = mesh.map(remove);
  mesh = [];
  project.clear();
}

function setSize () {
  var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  var c = document.getElementById('Trianglewave');
  c.style.width = width+'px';
  view.viewSize.width = width;
}


function resize () {
  
  reset();
  setSize();
  init();
}


window.addEventListener('resize', function () {
  clearTimeout(restizeTime);
  restizeTime = setTimeout(resize, 400)

})

init()
