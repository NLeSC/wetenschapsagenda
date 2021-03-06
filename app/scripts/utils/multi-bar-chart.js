
/**
 * Multibar chart/histogram implementation with transitions between stacked and grouped modes.
 * Example:
 * - [D3 Stacked-to-Grouped Bars](http://bl.ocks.org/mbostock/3943967)
 * @name multibarChart
 * @memberof dc
 * @mixes dc.stackMixin
 * @mixes dc.coordinateGridMixin
 * @example
 * // create a bar chart under #chart-container1 element using the default global chart group
 * var chart1 = dc.multibarChart('#chart-container1');
 * // create a bar chart under #chart-container2 element using chart group A
 * var chart2 = dc.multibarChart('#chart-container2', 'chartGroupA');
 * // create a sub-chart under a composite parent chart
 * var chart3 = dc.multibarChart(compositeChart);
 * //Change between grouped and stacked modes
 * chart1.setGroupedMode(true);
 * chart1.setGroupedMode(false);
 * @param {String|node|d3.selection|dc.compositeChart} parent - Any valid
 * [d3 single selector](https://github.com/mbostock/d3/wiki/Selections#selecting-elements) specifying
 * a dom block element such as a div; or a dom element or d3 selection.  If the bar chart is a sub-chart
 * in a [Composite Chart](#composite-chart) then pass in the parent composite chart instance.
 * @param {String} [chartGroup] - The name of the chart group this chart instance should be placed in.
 * Interaction with a chart will only trigger events and redraws within the chart's group.
 * @returns {MultiBarChart}
 */

/* global dc:false, d3:false */
'use strict';

dc.multiBarChart = function(parent, chartGroup) {
  var MIN_BAR_WIDTH = 1;
  var DEFAULT_GAP_BETWEEN_BARS = 2;
  var STACKED = 0;
  var GROUPED = 1;

  var _chart = dc.stackMixin(dc.coordinateGridMixin({}));

  var _gap = DEFAULT_GAP_BETWEEN_BARS;
  var _centerBar = false;
  var _alwaysUseRounding = false;

  var _barWidth;

  var _stackedOrGrouped = STACKED;

  dc.override(_chart, 'rescale', function() {
    _chart._rescale();
    _barWidth = undefined;
    return _chart;
  });

  dc.override(_chart, 'render', function() {
    if (_chart.round() && _centerBar && !_alwaysUseRounding) {
      dc.logger.warn('By default, brush rounding is disabled if bars are centered. ' +
        'See dc.js bar chart API documentation for details.');
    }

    return _chart._render();
  });

  function calculateBarWidth() {
    if (_barWidth === undefined) {
      var numberOfBars = _chart.xUnitCount();

      // please can't we always use rangeBands for bar charts?
      if (_chart.isOrdinal() && _gap === undefined) {
        _barWidth = Math.floor(_chart.x().rangeBand());
      } else if (_gap) {
        _barWidth = Math.floor((_chart.xAxisLength() - (numberOfBars - 1) * _gap) / numberOfBars);
      } else {
        _barWidth = Math.floor(_chart.xAxisLength() / (1 + _chart.barPadding()) / numberOfBars);
      }

      if (_barWidth === Infinity || isNaN(_barWidth) || _barWidth < MIN_BAR_WIDTH) {
        _barWidth = MIN_BAR_WIDTH;
      }
    }
  }

  _chart.plotData = function() {
    var layers = _chart.chartBodyG().selectAll('g.stack')
      .data(_chart.data());

    calculateBarWidth();

    layers
      .enter()
      .append('g')
      .attr('class', function(d, i) {
        return 'stack ' + '_' + i;
      });

    layers.each(function(d, i) {
      var layer = d3.select(this);

      renderBars(layer, i, d);
    });
  };

  function barHeight(d) {
    // return 2;
    return dc.utils.safeNumber(Math.abs(_chart.y()(d.y + d.y0) - _chart.y()(d.y0)));
  }

  function renderBars(layer, layerIndex, d) {

    var bars = layer.selectAll('rect.bar')
      .data(d.values, dc.pluck('x'));

    var enter = bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', dc.pluck('data', _chart.getColor))
      .attr('y', _chart.yAxisHeight())
      .attr('height', 0);

    if (_chart.renderTitle()) {
      enter.append('title').text(dc.pluck('data', _chart.title(d.name)));
    }

    if (_chart.isOrdinal()) {
      bars.on('click', _chart.onClick);
    }

    var stacks = _chart.stack();
    if (_stackedOrGrouped === STACKED) {
      // if(_chart.elasticY()) {
      //   var yStackMax = d3.max(stacks, function(stack) {
      //     return d3.max(stack.values, function(d) {
      //       return d.y0 + d.y;
      //     });
      //   });
      //
      //   _chart.y().domain([0, yStackMax]);
      //   _chart.y().range([_chart.yAxisHeight(), 0]);
      //   _chart.yAxis(_chart.yAxis().scale(_chart.y()));
      // }

      dc.transition(bars, _chart.transitionDuration())
        .attr('x', function(d) {
          var x = _chart.x()(d.x);
          if (_centerBar) {
            x -= _barWidth / 2;
          }
          if (_chart.isOrdinal() && _gap !== undefined) {
            x += _gap / 2;
          }
          return dc.utils.safeNumber(x);
        })
        .attr('y', function(d) {
          var y = _chart.y()(d.y + d.y0);

          if (d.y < 0) {
            y -= barHeight(d);
          }

          return dc.utils.safeNumber(y);
        })
        .attr('width', _barWidth)
        .attr('height', function(d) {
          return barHeight(d);
        })
        .attr('fill', dc.pluck('data', _chart.getColor))
        .select('title').text(dc.pluck('data', _chart.title(d.name)));
    } else {
      // if(_chart.elasticY()) {
      //   var yGroupMax = d3.max(stacks, function(stack) {
      //     return d3.max(stack.values, function(d) {
      //       return d.y;
      //     });
      //   });
      //
      //   _chart.y().domain([0, yGroupMax]);
      //   _chart.y().range([_chart.yAxisHeight(), 0]);
      //   _chart.yAxis(_chart.yAxis().scale(_chart.y()));
      // }

      var numStacks = stacks.length;
      var newBarWidth = _barWidth / numStacks;

      dc.transition(bars, _chart.transitionDuration())
        .attr('x', function(d) {
          var offset = 0;
          var stackNum = 0;
          stacks.forEach(function(stack) {
            if (stack.name === d.layer) {
              offset = newBarWidth * stackNum;
              return;
            } else {
              stackNum++;
            }
          });

          var x = _chart.x()(d.x) + offset;
          if (_centerBar) {
            x -= newBarWidth / 2;
          }
          if (_chart.isOrdinal() && _gap !== undefined) {
            var newGapWidth = _gap / numStacks;
            x += newGapWidth / 2;
          }
          return dc.utils.safeNumber(x);
        })
        .attr('y', function(d) {
          var y = _chart.y()(d.y);

          if (d.y < 0) {
            y -= barHeight(d);
          }

          return dc.utils.safeNumber(y);
        })
        .attr('width', newBarWidth)
        .attr('height', function(d) {
          return barHeight(d);
        })
        .attr('fill', dc.pluck('data', _chart.getColor))
        .select('title').text(dc.pluck('data', _chart.title(d.name)));
    }

    if(_chart.elasticY()) {
      recalculateYScale();
    }

    dc.transition(bars.exit(), _chart.transitionDuration())
      .attr('height', 0)
      .remove();
  }

  function recalculateYScale() {
    var stacks = _chart.stack();
    if (_stackedOrGrouped === STACKED) {
      var yStackMax = d3.max(stacks, function(stack) {
        return d3.max(stack.values, function(d) {
          return d.y0 + d.y;
        });
      });

      _chart.y().domain([0, yStackMax]);
    } else {
      var yGroupMax = d3.max(stacks, function(stack) {
        return d3.max(stack.values, function(d) {
          return d.y;
        });
      });

      _chart.y().domain([0, yGroupMax]);
    }
    _chart.y().range([_chart.yAxisHeight(), 0]);
    _chart.yAxis(_chart.yAxis().scale(_chart.y()));
  }

  function transitionGrouped() {
    //Check the number of stacks we have per bar
    var stacks = _chart.stack();
    var numStacks = stacks.length;

    //Apply transitions
    var bars = _chart.chartBodyG().selectAll('rect.bar');
    dc.transition(bars, _chart.transitionDuration())
    .attr('x', function(d) {
      // The x transition now takes into account the number of stacks per bar,
      // and calculates a new width and offset
      var newBarWidth = _barWidth / numStacks;
      var offset = 0;

      var stacks = _chart.stack();
      var stackNum = 0;
      stacks.forEach(function(stack) {
        if (stack.name === d.layer) {
          offset = newBarWidth * stackNum;
          return;
        } else {
          stackNum++;
        }
      });

      //The new width and offset are applied here
      var x = _chart.x()(d.x) + offset;
      if (_centerBar) {
        x -= newBarWidth / 2;
      }
      if (_chart.isOrdinal() && _gap !== undefined) {
        var newGapWidth = _gap / numStacks;
        x += newGapWidth / 2;
      }
      return dc.utils.safeNumber(x);
    })
    .attr('width', _barWidth / numStacks)

    .transition()
      .attr('y', function(d) {
        // The y transition comes after the x transition, to help track the data.
        // The new y coordinate is on the 'ground floor', the height stays the same (except for overall rescaling)
        var y = _chart.y()(d.y);

        if (d.y < 0) {
          y -= barHeight(d);
        }

        return dc.utils.safeNumber(y);
      })
      .attr('height', function(d) {
        return barHeight(d);
      });
  }

  function transitionStacked() {
    var bars = _chart.chartBodyG().selectAll('rect.bar');

    dc.transition(bars, _chart.transitionDuration())
    .attr('y', function(d) {
      var y = _chart.y()(d.y0 + d.y);

      if (d.y < 0) {
        y -= barHeight(d);
      }

      return dc.utils.safeNumber(y);
    })
    .attr('height', function(d) {
      var newHeight = _chart.y()(d.y0) - _chart.y()(d.y0 + d.y);
      return dc.utils.safeNumber(newHeight);
    })
    .transition()
      .attr('x', function(d) {
        var x = _chart.x()(d.x);
        if (_centerBar) {
          x -= _barWidth / 2;
        }
        if (_chart.isOrdinal() && _gap !== undefined) {
          x += _gap / 2;
        }
        return dc.utils.safeNumber(x);
      })
      .attr('width', _barWidth);
  }

  /**
   * Set the mode of this bar graph to be Stacked (default = false) or Grouped (=true)
   * @name setGroupedMode
   * @memberof dc.multibarChart
   * @instance
   * @param {Boolean} [value]
   * @returns
   */
  _chart.setGroupedMode = function(value) {
      if (value === true && _stackedOrGrouped === STACKED) {
        transitionGrouped();
        _stackedOrGrouped = GROUPED;
      } else if (value === false && _stackedOrGrouped === GROUPED) {
        transitionStacked();
        _stackedOrGrouped = STACKED;
      }

      if (_chart.elasticY()) {
        recalculateYScale();
        _chart.rescale();
        _chart.redraw();
      }
  };

  _chart.fadeDeselectedArea = function() {
    var bars = _chart.chartBodyG().selectAll('rect.bar');
    var extent = _chart.brush().extent();

    if (_chart.isOrdinal()) {
      if (_chart.hasFilter()) {
        bars.classed(dc.constants.SELECTED_CLASS, function(d) {
          return _chart.hasFilter(d.x);
        });
        bars.classed(dc.constants.DESELECTED_CLASS, function(d) {
          return !_chart.hasFilter(d.x);
        });
      } else {
        bars.classed(dc.constants.SELECTED_CLASS, false);
        bars.classed(dc.constants.DESELECTED_CLASS, false);
      }
    } else {
      if (!_chart.brushIsEmpty(extent)) {
        var start = extent[0];
        var end = extent[1];

        bars.classed(dc.constants.DESELECTED_CLASS, function(d) {
          return d.x < start || d.x >= end;
        });
      } else {
        bars.classed(dc.constants.DESELECTED_CLASS, false);
      }
    }
  };

  /**
   * Whether the bar chart will render each bar centered around the data position on x axis
   * @name centerBar
   * @memberof dc.multibarChart
   * @instance
   * @param {Boolean} [centerBar=false]
   * @returns {Boolean}
   */
  _chart.centerBar = function(centerBar) {
    if (!arguments.length) {
      return _centerBar;
    }
    _centerBar = centerBar;
    return _chart;
  };

  dc.override(_chart, 'onClick', function(d) {
    _chart._onClick(d.data);
  });

  /**
   * Get or set the spacing between bars as a fraction of bar size. Valid values are between 0-1.
   * Setting this value will also remove any previously set `gap`. See the
   * [d3 docs](https://github.com/mbostock/d3/wiki/Ordinal-Scales#wiki-ordinal_rangeBands)
   * for a visual description of how the padding is applied.
   * @name barPadding
   * @memberof dc.multibarChart
   * @instance
   * @param {Number} [barPadding]
   * @returns {Number}
   */
  _chart.barPadding = function(barPadding) {
    if (!arguments.length) {
      return _chart._rangeBandPadding();
    }
    _chart._rangeBandPadding(barPadding);
    _gap = undefined;
    return _chart;
  };

  _chart._useOuterPadding = function() {
    return _gap === undefined;
  };

  /**
   * Get or set the outer padding on an ordinal bar chart. This setting has no effect on non-ordinal charts.
   * Will pad the width by `padding * barWidth` on each side of the chart.
   * @name outerPadding
   * @memberof dc.multibarChart
   * @instance
   * @param {Number} [padding=0.5]
   * @returns {Number}
   */
  _chart.outerPadding = _chart._outerRangeBandPadding;

  /**
   * Manually set fixed gap (in px) between bars instead of relying on the default auto-generated
   * gap.  By default the bar chart implementation will calculate and set the gap automatically
   * based on the number of data points and the length of the x axis.
   * @name gap
   * @memberof dc.multibarChart
   * @instance
   * @param {Number} [gap=2]
   * @returns {Number}
   */
  _chart.gap = function(gap) {
    if (!arguments.length) {
      return _gap;
    }
    _gap = gap;
    return _chart;
  };

  _chart.extendBrush = function() {
    var extent = _chart.brush().extent();
    if (_chart.round() && (!_centerBar || _alwaysUseRounding)) {
      extent[0] = extent.map(_chart.round())[0];
      extent[1] = extent.map(_chart.round())[1];

      _chart.chartBodyG().select('.brush')
        .call(_chart.brush().extent(extent));
    }

    return extent;
  };

  /**
   * Set or get whether rounding is enabled when bars are centered.  Default: false.  If false, using
   * rounding with centered bars will result in a warning and rounding will be ignored.  This flag
   * has no effect if bars are not centered.
   * When using standard d3.js rounding methods, the brush often doesn't align correctly with
   * centered bars since the bars are offset.  The rounding function must add an offset to
   * compensate, such as in the following example.
   * @name alwaysUseRounding
   * @memberof dc.multibarChart
   * @instance
   * @example
   * chart.round(function(n) {return Math.floor(n)+0.5});
   * @param {Boolean} [alwaysUseRounding=false]
   * @returns {Boolean}
   */
  _chart.alwaysUseRounding = function(alwaysUseRounding) {
    if (!arguments.length) {
      return _alwaysUseRounding;
    }
    _alwaysUseRounding = alwaysUseRounding;
    return _chart;
  };

  function colorFilter(color, inv) {
    return function() {
      var item = d3.select(this);
      var match = item.attr('fill') === color;
      return inv ? !match : match;
    };
  }

  _chart.legendHighlight = function(d) {
    if (!_chart.isLegendableHidden(d)) {
      _chart.g().selectAll('rect.bar')
        .classed('highlight', colorFilter(d.color))
        .classed('fadeout', colorFilter(d.color, true));
    }
  };

  _chart.legendReset = function() {
    _chart.g().selectAll('rect.bar')
      .classed('highlight', false)
      .classed('fadeout', false);
  };

  dc.override(_chart, 'xAxisMax', function() {
    var max = this._xAxisMax();
    if ('resolution' in _chart.xUnits()) {
      var res = _chart.xUnits().resolution;
      max += res;
    }
    return max;
  });

  return _chart.anchor(parent, chartGroup);
};
