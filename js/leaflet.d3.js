L.D3geoJSON = L.Class.extend({

	includes: L.Mixin.Events,

	initialize: function(data, options) {
		this.data = data;
		this.options = options;
		var that = this;
		this._clickHandler = function(data, idx) {
			that.fire('click', {
				element: this,
				data: data,
				originalEvent: d3.event
			});
		};
	},

	onAdd: function(map) {
		this._map = map;

		this._svg = d3.select(this._map.getPanes().overlayPane).append('svg');
		this._svg.attr('pointer-events', 'none');
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

		this._feature = this._group.selectAll('path')
			.data(this.data.features)
			.enter()
				.append('path')
				.on('click', this._clickHandler);
		this._map.on('viewreset', this.reset, this);

		this._feature.attr('pointer-events', 'visible');

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
		var start = new Date();
		if (!this._bounds) {
			this._bounds = d3.geo.path().projection(null).bounds(this.data);
		}

		var topLeft = this._map.latLngToLayerPoint([this._bounds[0][1], this._bounds[0][0]]),
			bottomRight = this._map.latLngToLayerPoint([this._bounds[1][1], this._bounds[1][0]]);

		this._svg
			.attr('width', bottomRight.x - topLeft.x)
			.attr('height', topLeft.y - bottomRight.y)
			.style('left', topLeft.x + 'px')
			.style('top', bottomRight.y + 'px');

		this._group.attr('transform', 'translate(' + -topLeft.x + ',' + -bottomRight.y + ')');
		this._feature.attr('d', this.path);
		console.log((new Date()) - start);
	},

	addTo: function(map) {
		map.addLayer(this);
		return this;
	}
});