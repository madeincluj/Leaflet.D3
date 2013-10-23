L.D3geoJSON = L.Class.extend({

	includes: L.Mixin.Events,

	initialize: function(data, options) {
		this.data = data;
		this.options = options;
		var that = this;
		this._clickHandler = function(data, idx) {
			that.fire('click', {
				target: this,
				data: data
			});
		};
	},

	onAdd: function(map) {
		this._map = map;

		this._svg = d3.select(this._map.getPanes().overlayPane).append('svg');
		this._group = this._svg.append('g');
		this._group.attr('class', 'leaflet-zoom-hide ' + (this.options.className || ''));
		if (this.options.id) {
			this._group.attr('id', this.options.id);
		}

		this.path = d3.geo.path().projection(
			d3.geo.transform({
				point: function(x, y) {
		   	 		var point = map.latLngToLayerPoint(new L.LatLng(y, x));
		    		this.stream.point(point.x, point.y);
		  		}
			})
		);

		this._feature = this._group.selectAll('path').data(this.data.features).enter().append('path').on('click', this._clickHandler);
		this._map.on('viewreset', this.reset, this);

		if (this.options.featureAttributes) {
			for (var i in this.options.featureAttributes) {
				this._feature.attr(i, this.options.featureAttributes[i]);
			}
		}

		this.reset();
	},
	
	onRemove: function(map) {
		this._map.off('viewreset', this.reset, this);
	},

	reset: function() {
		this.bounds = this.path.bounds(this.data);

		var topLeft = this.bounds[0],
			bottomRight = this.bounds[1];

		this._svg
			.attr('width', bottomRight[0] - topLeft[0])
			.attr('height', bottomRight[1] - topLeft[1])
			.style('left', topLeft[0] + 'px')
			.style('top', topLeft[1] + 'px');

		this._group.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');
		this._feature.attr('d', this.path);
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	}
});