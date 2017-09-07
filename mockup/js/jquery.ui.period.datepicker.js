/**
* @description  
*   extends $.datepicker for fw requirements, include week, month, quarter
* @extends          $.datepicekr
* @requires         @.datepicker
*/

(function($) {
  /**
  * @description    This block is extend for date selectable range
  * @param{Boolean}   monthpicker   Default value is false, trigger to show monthpicker
  * @param{Boolean}   quarterpicker Default value is false, trigger to show quarterpicker
  * @example
  *   for monthpicker, set "monthpicker" as true
  *   for quarterpicker, set "quarterpicker" as true
  */
  $.extend(true, $.datepicker, {
    monthpicker: false,
    quarterpicker: false,
    /**
    * @public
    * @description      validate leap year
    * @param{String}    yyyy
    * @returns{Boolean} true / false
    */
    validateLeapYear: function(yearText) {
      return (yearText % 4 == 0 && yearText % 100 != 0) || (yearText % 400 == 0);
    },
    /**
    * @public
    * @description    get last day of month
    * @param{Object|String}  date as a Date object
    * @returns{String}  mm/dd/yyyy
    */
    getMonthLastDay: function(date) {
      if(typeof date == 'string') {
        date = new Date(date);
      }
      var year = date.getFullYear(),
          month = date.getMonth() + 1,
          realDate = date.getDate();
      if(month < 10) {
        month = '0' + month;
      }
      return month + '/' + (32 - new Date(year, month - 1, 32).getDate()) + '/' + year;
    },
    /**
    * @public
    * @description    set date range only Saturday selectable
    * @param{Object}  date as a Date object
    * @returns{[]} [[0] = true if selectable, false if not, [1] = custom CSS class name(s) or '']
    */
    onlySaturday: function(date) {
      var day = date.getDay();
      return [(day == 6), ''];
    },
    /**
    * @public
    * @description    set date range only Sunday selectable
    * @param{Object}  date as a Date object
    * @returns{[]} [[0] = true if selectable, false if not, [1] = custom CSS class name(s) or '']
    */
    onlySunday: function(date) {
      var day = date.getDay();
      return [(day == 0), ''];
    },
    /**
    * @public
    * @description    set date range only Saturday and Sunday selectable
    * @param{Object}  date as a Date object
    * @returns{[]} [[0] = true if selectable, false if not, [1] = custom CSS class name(s) or '']
    */
    onlyWeekends: function(date) {
      var day = date.getDay();
      return [(day == 0 || day == 6), ''];
    },
    /**
    * @public
    * @description    set date range only First Day of Month selectable
    * @param{Object}  date as a Date object
    * @returns{[]} [[0] = true if selectable, false if not, [1] = custom CSS class name(s) or '']
    */
    onlyMonthStartDay: function(date) {
      var realDate = date.getDate();
      return [(realDate == 1), ''];
    },
    /**
    * @public
    * @description    set date range only Last Day of Month selectable
    * @param{Object}  date as a Date object
    * @returns{[]} [[0] = true if selectable, false if not, [1] = custom CSS class name(s) or '']
    */
    onlyMonthEndDay: function(date) {
      var realDate = date.getDate(),
          month = date.getMonth(),
          year = date.getFullYear();
      return [(realDate == 32 - new Date(year, month - 1, 32).getDate()), ''];
    },
    /**
    * @public
    * @description    set date range only First Day and Last Day of month selectable
    * @param{Object}  date as a Date object
    * @returns{[]} [[0] = true if selectable, false if not, [1] = custom CSS class name(s) or '']
    */
    onlyMonthStartEndDay: function(date) {
      var realDate = date.getDate(),
          month = date.getMonth(),
          year = date.getFullYear();
      return [(realDate == 1 || realDate == 32 - new Date(year, month - 1, 32).getDate()), ''];
    },
    /**
    * @public
    * @description    set date range only Saturday, Sunday, First Day and Last Day of month selectable
    * @param{Object}  date as a Date object
    * @returns{[]) [[0] = true if selectable, false if not, [1] = custom CSS class name(s) or '']
    */
    onlyWeekMonthStartEndDay: function(date) {
      var day = date.getDay(),
          realDate = date.getDate(),
          month = date.getMonth(),
          year = date.getFullYear();
      return [(day == 0 || day == 6 || realDate == 1 || realDate == 32 - new Date(year, month - 1, 32).getDate()), ''];
    }
  });

  /**
  * @description extend for quarterpicker
  */
  $.extend(true, $.datepicker, {
    /**
    * @description generate quarter picker html structure
    */
    __buildQuarterView: function(inst, obj) {
      var $html = $('<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all" />'),
          drawYear = inst.mqYear || inst.drawYear,
          minDate = obj._getMinMaxDate(inst, 'min'),
          maxDate = obj._getMinMaxDate(inst, 'max'),
          selected = inst.input.val(),
          current = selected == '' ? false : new Date(selected),
          quarterName = ['Q1', 'Q2', 'Q3', 'Q4'];
      
      if(minDate) {
        minDate = new Date(minDate.setDate(1));
        minDate = new Date(minDate.setMonth(Math.floor(minDate.getMonth() / 3) * 3));
      }

      if(!inst.mqYear) {
        inst.mqYear = inst.drawYear;
      }

      var $prev = $('<a class="ui-datepicker-prev ui-corner-all ' + (obj.__canAdjustYear(-1, inst, minDate) ? '' : 'ui-state-disabled') + '" title="prev"><span class="ui-icon ui-icon-circle-triangle-w">Prev</span></a>'),
          $next = $('<a class="ui-datepicker-next ui-corner-all ' + (obj.__canAdjustYear(1, inst, maxDate) ? '' : 'ui-state-disabled') + '" title="next"><span class="ui-icon ui-icon-circle-triangle-e">Next</span></a>');

      $prev.not(".ui-state-disabled").click(function() {
        obj.__adjustQuarter(inst, -1, obj);
      });

      $next.not(".ui-state-disabled").click(function(){
        obj.__adjustQuarter(inst, 1, obj);
      });

      $html.append($prev);
      $html.append($next);
      $html.append(obj.__generateYearHeader(inst, obj));

      $html = $("<div/>").append($html).append('<table class="ui-datepicker-calendar ui-fwpicker-calendar"><tbody></tbody></table>');
      var tbody = '<tr>';
      for(var c = 0; c < 4; c++) {
        var num = c * 3,
            fixNum = num + 1,
            dateString = (fixNum < 10 ? ('0' + fixNum) : fixNum) + '/01/' + inst.mqYear,
            date = new Date(dateString),
            selected = current && num <= current.getMonth() && (num + 3) > current.getMonth() && inst.mqYear == current.getFullYear();
        
        tbody += ((!minDate || date.getTime() >= minDate.getTime()) && (!maxDate || date.getTime() <= maxDate.getTime())) ? 
                 '<td class="' + (selected ? ' ui-datepicker-current-day' : '') + '"><a class="ui-state-default' + (selected ? ' ui-state-active' : '') + '" href="#" title="' + dateString + '">' + quarterName[c] + '</a>' : 
                 '<td class="ui-datepicker-unselectable ui-state-disabled"><span class="ui-state-default" title="' + dateString + '">' + quarterName[c] + '</span>';
        tbody += '</td>';
      }
      tbody += '</tr>';
      var $tbody = $(tbody);
      $tbody.find("a.ui-state-default").click(function() {
        obj.__selectQuarter(inst, $(this), obj);
      });
      $html.find("table").css("marginTop", "5px").children('tbody').append($tbody);
      return $html.children();
    },
    /**
    * @description update to show quarterpicker
    */
    __updateQuarterpicker: function(inst, obj) {
      inst.dpDiv.empty().unbind('mouseover').append(obj.__buildQuarterView(inst, obj));
    },
    /**
    * @description jump to other year
    * @param{Interger} offset -1 means prev, 1 means next
    */
    __adjustQuarter: function(inst, offset, obj) { // For Prev & Next Click
      inst.mqYear += offset;
      obj.__updateQuarterpicker(inst, obj);
    },
    /**
    * @description when user select a quarter will trigger this method, it will update state of picker and set value in trigger "input" field
    */
    __selectQuarter: function(inst, $obj, obj) {
      var val = $obj.attr("title"),
          eventSelect = obj._get(inst, 'onSelect');
      
      if(obj._get(inst, 'lastDay')) {
        val = val.split('/');
        val[0] = Math.floor(val[0] / 3) * 3 + 3;
        val = val[0] + '/' + (32 - new Date(val[2], val[0] - 1, 32).getDate()) + '/' + val[2];
      }

      inst.input.val(val);
      
      if (eventSelect)
        eventSelect.apply(inst.input, [val, inst]);
      obj._hideDatepicker();
      obj._lastInput = null;
    }
  });

  /**
  * @description extend for monthpicker
  */
  $.extend(true, $.datepicker, {
    /**
    * @description generate monthpicker or quarterpicker year header
    */
    __generateYearHeader: function(inst, obj) {
      return '<div class="ui-datepicker-title"><span class="ui-datepicker-year-header">' + inst.mqYear + '</span></div>';
    },
    /**
    * @description generate month picker html structure
    */
    __buildMonthView: function(inst, obj) {
      var $html = $('<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all" />'),
          drawYear = inst.mqYear || inst.drawYear,
          minDate = obj._getMinMaxDate(inst, 'min'),
          maxDate = obj._getMinMaxDate(inst, 'max'),
          selected = inst.input.val(),
          current = selected == '' ? false : new Date(selected),
          jMonth = obj._getFormatConfig(inst);
      
      if(!inst.mqYear) {
        inst.mqYear = inst.drawYear;
      }

      if(minDate) {
        minDate = new Date(minDate.setDate(1));
      }

      var $prev = $('<a class="ui-datepicker-prev ui-corner-all ' + (obj.__canAdjustYear(-1, inst, minDate) ? '' : 'ui-state-disabled') + '" title="prev"><span class="ui-icon ui-icon-circle-triangle-w">Prev</span></a>'),
          $next = $('<a class="ui-datepicker-next ui-corner-all ' + (obj.__canAdjustYear(1, inst, maxDate) ? '' : 'ui-state-disabled') + '" title="next"><span class="ui-icon ui-icon-circle-triangle-e">Next</span></a>');

      $prev.not(".ui-state-disabled").click(function() {
        obj.__adjustMonth(inst, -1, obj);
      });

      $next.not(".ui-state-disabled").click(function(){
        obj.__adjustMonth(inst, 1, obj);
      });

      $html.append($prev);
      $html.append($next);
      $html.append(obj.__generateYearHeader(inst, obj));

      $html = $("<div/>").append($html).append('<table class="ui-datepicker-calendar ui-fwpicker-calendar"><tbody></tbody></table>');
      var tbody = '';

      for(var r = 0; r < 3; r++) {
        tbody += '<tr>';
        for(var c = 0; c < 4; c++) {
          var num = r * 4 + c,
              fixNum = num + 1,
              dateString = (fixNum < 10 ? ('0' + fixNum) : fixNum) + '/01/' + inst.mqYear,
              date = new Date(dateString),
              selected = current && num == current.getMonth() && inst.mqYear == current.getFullYear();

          tbody += ((!minDate || date.getTime() >= minDate.getTime()) && (!maxDate || date.getTime() <= maxDate.getTime())) ? 
                   '<td class="' + (selected ? ' ui-datepicker-current-day' : '') + '"><a class="ui-state-default' + (selected ? ' ui-state-active' : '') + '" href="#" title="' + dateString + '">' + jMonth.monthNamesShort[num] + '</a>' : 
                   '<td class="ui-datepicker-unselectable ui-state-disabled"><span class="ui-state-default" title="' + dateString + '">' + jMonth.monthNamesShort[num] + '</span>';
          tbody += '</td>';
        }
        tbody += '</tr>';
      }
      var $tbody = $(tbody);
      $tbody.find("a.ui-state-default").click(function() {
        obj.__selectMonth(inst, $(this), obj);
      });
      $html.find("table").css("marginTop", "5px").children('tbody').append($tbody);
      return $html.children();
    },
    /**
    * @description update to show monthpicker
    */
    __updateMonthpicker: function(inst, obj) {
      inst.dpDiv.empty().unbind('mouseover').append(obj.__buildMonthView(inst, obj));
    },
    /**
    * @description validate whether user can jump to target year
    * @param{Interger} offset -1 means validation prev year, 1 means validation of next year
    */
    __canAdjustYear: function(offset, inst, date) {
      var value = true;

      if(!date) {
        return value;
      }

      var yearRange  = date.getFullYear(),
          year  = inst.mqYear;
      
      if((offset > 0 && year >= yearRange) || (offset < 0 && yearRange >= year)) {
        value = false;
      }

      return value;
    },
    /**
    * @description jump to other year
    * @param{Interger} offset -1 means prev, 1 means next
    */
    __adjustMonth: function(inst, offset, obj) { // For Prev & Next Click
      inst.mqYear += offset;
      obj.__updateMonthpicker(inst, obj);
    },
    /**
    * @description when user select a month will trigger this method, it will update state of picker and set value in trigger "input" field
    */
    __selectMonth: function(inst, $obj, obj) {
      var val = $obj.attr("title"),
          eventSelect = obj._get(inst, 'onSelect');

      if(obj._get(inst, 'lastDay')) {
        val = val.split('/');
        val = (val[0] + '/' + (32 - new Date(val[2], val[0] - 1, 32).getDate()) + '/' + val[2]);
      }

      inst.input.val(val);
      
      if (eventSelect)
        eventSelect.apply(inst.input, [val, inst]);
      obj._hideDatepicker();
      obj._lastInput = null;
    }
  });

  /**
  * @description store for original datepicker methods
  */
  $.extend(true, $.datepicker, {
    _originalUpdateDatepicker: $.datepicker._updateDatepicker,
    _originalSelectDay: $.datepicker._selectDay,
    _originalCanAdjustMonth: $.datepicker._canAdjustMonth,
    _originalAdjustDate: $.datepicker._adjustDate
  });

  /**
  * @description set condition to decide whether replace original function
  */
  $.extend($.datepicker, {
    _updateDatepicker: function(inst) {
      var self = this;
      var abc = new Date().getTime();
      if(self._get(inst, 'monthpicker')) {
        $.datepicker.__updateMonthpicker(inst, self);
      }
      else if(self._get(inst, 'quarterpicker')) {
        $.datepicker.__updateQuarterpicker(inst, self);
      }
      else {
        $.datepicker._originalUpdateDatepicker(inst);
      }
    },
    _selectDay: function(id, month, year, td) {
      var self = this;
      if(self._get(self._curInst, 'monthpicker')) {
        $.datepicker.__selectMonth(id, month, year, td, self);
      }
      else {
        $.datepicker._originalSelectDay(id, month, year, td);
      }
    },
    _adjustDate: function(id, offset, period) {
      var self = this,
          inst = self._curInst;
      if(self._get(inst, 'monthpicker')) {
        return $.datepicker.__adjustMonth(inst, offset, self);
      }
      else if(self._get(inst, 'quarterpicker')) {
        $.datepicker.__adjustQuarter(inst, offset, self);
      }
      else {
        return $.datepicker._originalAdjustDate(id, offset, period);
      }
    },
    _canAdjustMonth: function(inst, offset, curYear, curMonth) {
      var self = this;
      if(self._get(inst, 'monthpicker') || self._get(inst, 'quarterpicker')) {
        return $.datepicker.__canAdjustYear(inst, offset, curYear, curMonth, self);
      }
      else {
        return $.datepicker._originalCanAdjustMonth(inst, offset, curYear, curMonth);
      }
    }
  });
})(jQuery);