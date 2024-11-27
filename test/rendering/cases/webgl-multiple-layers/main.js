import DataTile from '../../../../src/ol/source/DataTile.js';
import KML from '../../../../src/ol/format/KML.js';
import Map from '../../../../src/ol/Map.js';
import VectorLayer from '../../../../src/ol/layer/Vector.js';
import TileLayer from '../../../../src/ol/layer/WebGLTile.js';
import VectorSource from '../../../../src/ol/source/Vector.js';
import WebGLVectorRenderer from 'ol/renderer/webgl/VectorLayer.js';
import View from '../../../../src/ol/View.js';
import XYZ from '../../../../src/ol/source/XYZ.js';

const labelCanvasSize = 256;

const labelCanvas = document.createElement('canvas');
labelCanvas.width = labelCanvasSize;
labelCanvas.height = labelCanvasSize;

const labelContext = labelCanvas.getContext('2d');
labelContext.textAlign = 'center';
labelContext.font = '16px sans-serif';
const labelLineHeight = 16;

class WebGLVectorLayer extends VectorLayer {
  createRenderer() {
    return new WebGLVectorRenderer(this, {
        style: {
          'circle-radius': 3,
          'circle-fill-color': 'orange',
        },
    });
  }
}

new Map({
  layers: [
    new TileLayer({
      source: new XYZ({
        url: '/data/tiles/satellite/{z}/{x}/{y}.jpg',
        transition: 0,
      }),
    }),
    new WebGLVectorLayer({
      opacity: 0.5,
      source: new VectorSource({
        url: '/data/2012_Earthquakes_Mag5.kml',
        format: new KML({
          extractStyles: false,
        }),
      }),
    }),
    new TileLayer({
      source: new DataTile({
        wrapX: true,
        loader: function (z, x, y) {
          const half = labelCanvasSize / 2;

          labelContext.clearRect(0, 0, labelCanvasSize, labelCanvasSize);

          labelContext.fillStyle = 'white';
          labelContext.fillText(`z: ${z}`, half, half - labelLineHeight);
          labelContext.fillText(`x: ${x}`, half, half);
          labelContext.fillText(`y: ${y}`, half, half + labelLineHeight);

          labelContext.strokeStyle = 'white';
          labelContext.lineWidth = 2;
          labelContext.strokeRect(0, 0, labelCanvasSize, labelCanvasSize);

          const data = labelContext.getImageData(
            0,
            0,
            labelCanvasSize,
            labelCanvasSize,
          ).data;
          return new Uint8Array(data.buffer);
        },
        transition: 0,
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [15180597.9736, 2700366.3807],
    zoom: 2,
  }),
});

render({
  message: 'multiple WebGL layers are rendered',
});
