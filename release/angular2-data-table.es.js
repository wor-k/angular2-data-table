/**
 * angular2-data-table v0.1.14 (https://github.com/swimlane/angular2-data-table#readme)
 * Copyright 2016  
 * Licensed under MIT
 */
import { KeyValueDiffers, ElementRef, Component, HostListener, ContentChildren, EventEmitter, Output, Input, Injectable, Directive, HostBinding, TemplateRef, ContentChild, QueryList, ComponentResolver, ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}

function columnsByPin(cols) {
    var ret = {
        left: [],
        center: [],
        right: []
    };
    if (cols) {
        for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
            var col = cols_1[_i];
            if (col.frozenLeft) {
                ret.left.push(col);
            }
            else if (col.frozenRight) {
                ret.right.push(col);
            }
            else {
                ret.center.push(col);
            }
        }
    }
    return ret;
}
;
function columnGroupWidths(groups, all) {
    return {
        left: columnTotalWidth(groups.left),
        center: columnTotalWidth(groups.center),
        right: columnTotalWidth(groups.right),
        total: columnTotalWidth(all)
    };
}
function columnTotalWidth(columns, prop) {
    var totalWidth = 0;
    if (columns) {
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var c = columns_1[_i];
            var has = prop && c[prop];
            totalWidth = totalWidth + (has ? c[prop] : c.width);
        }
    }
    return totalWidth;
}
;

function scrollbarWidth() {
    var outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.msOverflowStyle = 'scrollbar';
    document.body.appendChild(outer);
    var widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';
    var inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);
    var widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    return widthNoScroll - widthWithScroll;
}
;

var SortType;
(function (SortType) {
    SortType[SortType["single"] = 'single'] = "single";
    SortType[SortType["multi"] = 'multi'] = "multi";
})(SortType || (SortType = {}));

var SortDirection;
(function (SortDirection) {
    SortDirection[SortDirection["asc"] = 'asc'] = "asc";
    SortDirection[SortDirection["desc"] = 'desc'] = "desc";
})(SortDirection || (SortDirection = {}));

function nextSortDir(sortType, current) {
    if (sortType === SortType.single) {
        if (current === SortDirection.asc) {
            return SortDirection.desc;
        }
        else {
            return SortDirection.asc;
        }
    }
    else {
        if (!current) {
            return SortDirection.asc;
        }
        else if (current === SortDirection.asc) {
            return SortDirection.desc;
        }
        else if (current === SortDirection.desc) {
            return undefined;
        }
    }
}
;
function orderByComparator(a, b) {
    if (a === null || typeof a === 'undefined')
        a = 0;
    if (b === null || typeof b === 'undefined')
        b = 0;
    if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
        if (a.toLowerCase() < b.toLowerCase())
            return -1;
        if (a.toLowerCase() > b.toLowerCase())
            return 1;
    }
    else {
        if (parseFloat(a) < parseFloat(b))
            return -1;
        if (parseFloat(a) > parseFloat(b))
            return 1;
    }
    return 0;
}
function sortRows(rows, dirs) {
    var temp = rows.slice();
    return temp.sort(function (a, b) {
        for (var _i = 0, dirs_1 = dirs; _i < dirs_1.length; _i++) {
            var _a = dirs_1[_i], prop = _a.prop, dir = _a.dir;
            var comparison = dir !== SortDirection.desc ?
                orderByComparator(a[prop], b[prop]) :
                -orderByComparator(a[prop], b[prop]);
            if (comparison !== 0)
                return comparison;
        }
        return 0;
    });
}

var Sort = (function () {
    function Sort(props) {
        Object.assign(this, props);
    }
    return Sort;
}());

var StateService = (function () {
    function StateService() {
        this.onSelectionChange = new EventEmitter();
        this.onRowsUpdate = new EventEmitter();
        this.onPageChange = new EventEmitter();
        this.scrollbarWidth = scrollbarWidth();
        this.offsetX = 0;
        this.offsetY = 0;
        this.innerWidth = 0;
        this.bodyHeight = 300;
        this.HScrollPos = 0;
    }
    Object.defineProperty(StateService.prototype, "columnsByPin", {
        get: function () {
            return columnsByPin(this.options.columns);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateService.prototype, "columnGroupWidths", {
        get: function () {
            return columnGroupWidths(this.columnsByPin, this.options.columns);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateService.prototype, "pageCount", {
        get: function () {
            if (!this.options.externalPaging) {
                return this.rows.length;
            }
            else {
                return this.options.count;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateService.prototype, "pageSize", {
        get: function () {
            if (this.options.scrollbarV) {
                return Math.ceil(this.bodyHeight / this.options.rowHeight) + 1;
            }
            else if (this.options.limit) {
                return this.options.limit;
            }
            else {
                return this.rows.length;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StateService.prototype, "indexes", {
        get: function () {
            var first = 0;
            var last = 0;
            if (this.options.scrollbarV) {
                var floor = Math.floor((this.offsetY || 0) / this.options.rowHeight);
                first = Math.max(floor, 0);
                last = Math.min(first + this.pageSize, this.pageCount);
            }
            else {
                first = Math.max(this.options.offset * this.pageSize, 0);
                last = Math.min(first + this.pageSize, this.pageCount);
            }
            return { first: first, last: last };
        },
        enumerable: true,
        configurable: true
    });
    StateService.prototype.setSelected = function (selected) {
        if (!this.selected) {
            this.selected = selected || [];
        }
        else {
            this.selected.splice(0, this.selected.length);
            (_a = this.selected).push.apply(_a, selected);
        }
        this.onSelectionChange.emit(this.selected);
        return this;
        var _a;
    };
    StateService.prototype.setRows = function (rows) {
        if (rows) {
            this.rows = rows.slice();
            this.onRowsUpdate.emit(rows);
        }
        return this;
    };
    StateService.prototype.setOptions = function (options) {
        this.options = options;
        return this;
    };
    StateService.prototype.setPage = function (page) {
        this.options.offset = page - 1;
        this.onPageChange.emit({
            offset: this.options.offset,
            limit: this.pageSize,
            count: this.pageCount
        });
    };
    StateService.prototype.nextSort = function (column) {
        var idx = this.options.sorts.findIndex(function (s) { return s.prop === column.prop; });
        var curSort = this.options.sorts[idx];
        var curDir = undefined;
        if (curSort)
            curDir = curSort.dir;
        var dir = nextSortDir(this.options.sortType, curDir);
        if (dir === undefined) {
            this.options.sorts.splice(idx, 1);
        }
        else if (curSort) {
            this.options.sorts[idx].dir = dir;
        }
        else {
            if (this.options.sortType === SortType.single) {
                this.options.sorts.splice(0, this.options.sorts.length);
            }
            this.options.sorts.push(new Sort({ dir: dir, prop: column.prop }));
        }
        if (!column.comparator) {
            this.setRows(sortRows(this.rows, this.options.sorts));
        }
        else {
            column.comparator(this.rows, this.options.sorts);
        }
    };
    StateService = __decorate([
        Injectable(), 
        __metadata('design:paramtypes', [])
    ], StateService);
    return StateService;
}());

var VisibilityObserver = (function () {
    function VisibilityObserver(element, callback) {
        this.callback = callback;
        this.runPolyfill(element);
    }
    VisibilityObserver.prototype.runPolyfill = function (element) {
        var _this = this;
        var checkVisibility = function () {
            var _a = element.getBoundingClientRect(), width = _a.width, height = _a.height;
            if (width && height) {
                _this.callback && _this.callback();
            }
            else {
                setTimeout(function () { return checkVisibility(); }, 10);
            }
        };
        checkVisibility();
    };
    VisibilityObserver.prototype.isVisible = function (boundingClientRect, intersectionRect) {
        return ((intersectionRect.width * intersectionRect.height) /
            (boundingClientRect.width * boundingClientRect.height) >= 0.5);
    };
    VisibilityObserver.prototype.visibleTimerCallback = function (element, observer) {
        delete element.visibleTimeout;
        this.processChanges(observer.takeRecords());
        if ('isVisible' in element) {
            delete element.isVisible;
            this.callback && this.callback();
            observer.unobserve(element);
        }
    };
    VisibilityObserver.prototype.processChanges = function (changes) {
        var _this = this;
        changes.forEach(function (changeRecord) {
            var element = changeRecord.target;
            element.isVisible = _this.isVisible(changeRecord.boundingClientRect, changeRecord.intersectionRect);
            if ('isVisible' in element) {
                element.visibleTimeout = setTimeout(_this.visibleTimerCallback.bind(_this), 1000, element, _this.observer);
            }
            else {
                if ('visibleTimeout' in element) {
                    clearTimeout(element.visibleTimeout);
                    delete element.visibleTimeout;
                }
            }
        });
    };
    return VisibilityObserver;
}());

var Visibility = (function () {
    function Visibility(element) {
        this.visible = false;
        this.onVisibilityChange = new EventEmitter();
        new VisibilityObserver(element.nativeElement, this.visbilityChange.bind(this));
    }
    Visibility.prototype.visbilityChange = function () {
        this.visible = true;
        this.onVisibilityChange.emit(true);
    };
    __decorate([
        HostBinding('class.visible'), 
        __metadata('design:type', Boolean)
    ], Visibility.prototype, "visible", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], Visibility.prototype, "onVisibilityChange", void 0);
    Visibility = __decorate([
        Directive({ selector: '[visibility-observer]' }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _b) || Object])
    ], Visibility);
    return Visibility;
    var _a, _b;
}());

function columnTotalWidth$1(columns, prop) {
    var totalWidth = 0;
    for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
        var column = columns_1[_i];
        var has = prop && column[prop];
        totalWidth = totalWidth + (has ? column[prop] : column.width);
    }
    return totalWidth;
}
function getTotalFlexGrow(columns) {
    var totalFlexGrow = 0;
    for (var _i = 0, columns_2 = columns; _i < columns_2.length; _i++) {
        var c = columns_2[_i];
        totalFlexGrow += c.flexGrow || 0;
    }
    return totalFlexGrow;
}
function adjustColumnWidths(allColumns, expectedWidth) {
    var columnsWidth = columnTotalWidth$1(allColumns), totalFlexGrow = getTotalFlexGrow(allColumns), colsByGroup = columnsByPin(allColumns);
    if (columnsWidth !== expectedWidth) {
        scaleColumns(colsByGroup, expectedWidth, totalFlexGrow);
    }
}
function scaleColumns(colsByGroup, maxWidth, totalFlexGrow) {
    for (var attr in colsByGroup) {
        for (var _i = 0, _a = colsByGroup[attr]; _i < _a.length; _i++) {
            var column = _a[_i];
            if (!column.canAutoResize) {
                maxWidth -= column.width;
                totalFlexGrow -= column.flexGrow;
            }
            else {
                column.width = 0;
            }
        }
    }
    var hasMinWidth = {};
    var remainingWidth = maxWidth;
    do {
        var widthPerFlexPoint = remainingWidth / totalFlexGrow;
        remainingWidth = 0;
        for (var attr in colsByGroup) {
            for (var _b = 0, _c = colsByGroup[attr]; _b < _c.length; _b++) {
                var column = _c[_b];
                if (column.canAutoResize && !hasMinWidth[column.prop]) {
                    var newWidth = column.width + column.flexGrow * widthPerFlexPoint;
                    if (column.minWidth !== undefined && newWidth < column.minWidth) {
                        remainingWidth += newWidth - column.minWidth;
                        column.width = column.minWidth;
                        hasMinWidth[column.prop] = true;
                    }
                    else {
                        column.width = newWidth;
                    }
                }
            }
        }
    } while (remainingWidth !== 0);
}
function forceFillColumnWidths(allColumns, expectedWidth, startIdx) {
    var contentWidth = 0, columnsToResize = startIdx > -1 ?
        allColumns.slice(startIdx, allColumns.length).filter(function (c) { return c.canAutoResize; }) :
        allColumns.filter(function (c) { return c.canAutoResize; });
    for (var _i = 0, allColumns_1 = allColumns; _i < allColumns_1.length; _i++) {
        var column = allColumns_1[_i];
        if (!column.canAutoResize) {
            contentWidth += column.width;
        }
        else {
            contentWidth += (column.$$oldWidth || column.width);
        }
    }
    var remainingWidth = expectedWidth - contentWidth, additionWidthPerColumn = remainingWidth / columnsToResize.length, exceedsWindow = contentWidth > expectedWidth;
    for (var _a = 0, columnsToResize_1 = columnsToResize; _a < columnsToResize_1.length; _a++) {
        var column = columnsToResize_1[_a];
        if (exceedsWindow) {
            column.width = column.$$oldWidth || column.width;
        }
        else {
            if (!column.$$oldWidth) {
                column.$$oldWidth = column.width;
            }
            var newSize = column.$$oldWidth + additionWidthPerColumn;
            if (column.minWith && newSize < column.minWidth) {
                column.width = column.minWidth;
            }
            else if (column.maxWidth && newSize > column.maxWidth) {
                column.width = column.maxWidth;
            }
            else {
                column.width = newSize;
            }
        }
    }
}

var ColumnMode;
(function (ColumnMode) {
    ColumnMode[ColumnMode["standard"] = 'standard'] = "standard";
    ColumnMode[ColumnMode["flex"] = 'flex'] = "flex";
    ColumnMode[ColumnMode["force"] = 'force'] = "force";
})(ColumnMode || (ColumnMode = {}));

var TableOptions = (function () {
    function TableOptions(props) {
        this.columns = [];
        this.scrollbarV = false;
        this.scrollbarH = false;
        this.rowHeight = 30;
        this.columnMode = ColumnMode.standard;
        this.loadingMessage = 'Loading...';
        this.emptyMessage = 'No data to display';
        this.headerHeight = 30;
        this.footerHeight = 0;
        this.externalPaging = false;
        this.limit = undefined;
        this.count = 0;
        this.offset = 0;
        this.loadingIndicator = false;
        this.reorderable = true;
        this.sortType = SortType.single;
        this.sorts = [];
        Object.assign(this, props);
    }
    return TableOptions;
}());

function id() {
    return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}
;

function camelCase(str) {
    str = str.replace(/[^a-zA-Z0-9 ]/g, " ");
    str = str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    str = str.replace(/([^a-zA-Z0-9 ])|^[0-9]+/g, '').trim().toLowerCase();
    str = str.replace(/([ 0-9]+)([a-zA-Z])/g, function (a, b, c) {
        return b.trim() + c.toUpperCase();
    });
    return str;
}
;

var TableColumn = (function () {
    function TableColumn(props) {
        this.$$id = id();
        this.isExpressive = false;
        this.frozenLeft = false;
        this.frozenRight = false;
        this.flexGrow = 0;
        this.minWidth = 100;
        this.maxWidth = undefined;
        this.width = 150;
        this.resizeable = true;
        this.comparator = undefined;
        this.sortable = true;
        this.draggable = true;
        this.canAutoResize = true;
        Object.assign(this, props);
        if (!this.prop && this.name) {
            this.prop = camelCase(this.name);
        }
    }
    TableColumn.getProps = function () {
        var props = ['name', 'prop'];
        var col = new TableColumn();
        for (var prop in col) {
            props.push(prop);
        }
        return props;
    };
    return TableColumn;
}());
;

var DataTableColumn = (function () {
    function DataTableColumn() {
    }
    __decorate([
        ContentChild(TemplateRef), 
        __metadata('design:type', Object)
    ], DataTableColumn.prototype, "template", void 0);
    DataTableColumn = __decorate([
        Directive({
            selector: 'datatable-column',
            inputs: TableColumn.getProps()
        }), 
        __metadata('design:paramtypes', [])
    ], DataTableColumn);
    return DataTableColumn;
}());

var LongPress = (function () {
    function LongPress() {
        this.duration = 500;
        this.onLongPress = new EventEmitter();
        this.onLongPressing = new EventEmitter();
        this.onLongPressEnd = new EventEmitter();
        this.mouseX = 0;
        this.mouseY = 0;
    }
    Object.defineProperty(LongPress.prototype, "press", {
        get: function () { return this.pressing; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LongPress.prototype, "longPress", {
        get: function () { return this.longPressing; },
        enumerable: true,
        configurable: true
    });
    LongPress.prototype.onMouseDown = function (event) {
        var _this = this;
        if (event.which !== 1)
            return;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.pressing = true;
        this.longPressing = false;
        this.timeout = setTimeout(function () {
            _this.longPressing = true;
            _this.onLongPress.emit(event);
            _this.loop(event);
        }, this.duration);
        this.loop(event);
    };
    LongPress.prototype.onMouseMove = function (event) {
        if (this.pressing && !this.longPressing) {
            var xThres = (event.clientX - this.mouseX) > 10;
            var yThres = (event.clientY - this.mouseY) > 10;
            if (xThres || yThres) {
                this.endPress();
            }
        }
    };
    LongPress.prototype.loop = function (event) {
        var _this = this;
        if (this.longPressing) {
            this.timeout = setTimeout(function () {
                _this.onLongPressing.emit(event);
                _this.loop(event);
            }, 50);
        }
    };
    LongPress.prototype.endPress = function () {
        clearTimeout(this.timeout);
        this.longPressing = false;
        this.pressing = false;
        this.onLongPressEnd.emit(true);
    };
    LongPress.prototype.onMouseUp = function () { this.endPress(); };
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], LongPress.prototype, "duration", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], LongPress.prototype, "onLongPress", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_b = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _b) || Object)
    ], LongPress.prototype, "onLongPressing", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_c = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _c) || Object)
    ], LongPress.prototype, "onLongPressEnd", void 0);
    __decorate([
        HostBinding('class.press'), 
        __metadata('design:type', Object)
    ], LongPress.prototype, "press", null);
    __decorate([
        HostBinding('class.longpress'), 
        __metadata('design:type', Object)
    ], LongPress.prototype, "longPress", null);
    __decorate([
        HostListener('mousedown', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], LongPress.prototype, "onMouseDown", null);
    __decorate([
        HostListener('mousemove', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], LongPress.prototype, "onMouseMove", null);
    __decorate([
        HostListener('mouseup'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], LongPress.prototype, "onMouseUp", null);
    LongPress = __decorate([
        Directive({ selector: '[long-press]' }), 
        __metadata('design:paramtypes', [])
    ], LongPress);
    return LongPress;
    var _a, _b, _c;
}());

var Draggable = (function () {
    function Draggable(element) {
        this.dragX = true;
        this.dragY = true;
        this.onDragStart = new EventEmitter();
        this.onDragging = new EventEmitter();
        this.onDragEnd = new EventEmitter();
        this.dragging = false;
        this.element = element.nativeElement;
    }
    Draggable.prototype.onMouseup = function (event) {
        this.dragging = false;
        this.element.classList.remove('dragging');
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.onDragEnd.emit({
                event: event,
                element: this.element,
                model: this.model
            });
        }
    };
    Draggable.prototype.onMousedown = function (event) {
        var _this = this;
        if (event.target.classList.contains('draggable')) {
            event.preventDefault();
            this.dragging = true;
            var mouseDownPos_1 = { x: event.clientX, y: event.clientY };
            this.subscription = Observable.fromEvent(document, 'mousemove')
                .subscribe(function (event) { return _this.move(event, mouseDownPos_1); });
            this.onDragStart.emit({
                event: event,
                element: this.element,
                model: this.model
            });
        }
    };
    Draggable.prototype.move = function (event, mouseDownPos) {
        if (!this.dragging)
            return;
        var x = event.clientX - mouseDownPos.x;
        var y = event.clientY - mouseDownPos.y;
        if (this.dragX)
            this.element.style.left = x + "px";
        if (this.dragY)
            this.element.style.top = y + "px";
        if (this.dragX || this.dragY) {
            this.element.classList.add('dragging');
            this.onDragging.emit({
                event: event,
                element: this.element,
                model: this.model
            });
        }
    };
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], Draggable.prototype, "model", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Boolean)
    ], Draggable.prototype, "dragX", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Boolean)
    ], Draggable.prototype, "dragY", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], Draggable.prototype, "onDragStart", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_b = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _b) || Object)
    ], Draggable.prototype, "onDragging", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_c = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _c) || Object)
    ], Draggable.prototype, "onDragEnd", void 0);
    __decorate([
        HostListener('document:mouseup', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Draggable.prototype, "onMouseup", null);
    __decorate([
        HostListener('mousedown', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Draggable.prototype, "onMousedown", null);
    Draggable = __decorate([
        Directive({ selector: '[draggable]' }), 
        __metadata('design:paramtypes', [(typeof (_d = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _d) || Object])
    ], Draggable);
    return Draggable;
    var _a, _b, _c, _d;
}());

var Resizeable = (function () {
    function Resizeable(element) {
        this.resizeEnabled = true;
        this.onResize = new EventEmitter();
        this.prevScreenX = 0;
        this.resizing = false;
        this.element = element.nativeElement;
        if (this.resizeEnabled) {
            var node = document.createElement('span');
            node.classList.add('resize-handle');
            this.element.appendChild(node);
        }
    }
    Resizeable.prototype.onMouseup = function (event) {
        this.resizing = false;
        if (this.subcription) {
            this.subcription.unsubscribe();
            this.onResize.emit(this.element.clientWidth);
        }
    };
    Resizeable.prototype.onMousedown = function (event) {
        var _this = this;
        var isHandle = event.target.classList.contains('resize-handle');
        if (isHandle) {
            event.stopPropagation();
            this.resizing = true;
            this.subcription = Observable.fromEvent(document, 'mousemove')
                .subscribe(function (e) { return _this.move(e); });
        }
    };
    Resizeable.prototype.move = function (event) {
        var movementX = event.movementX || event.mozMovementX || (event.screenX - this.prevScreenX);
        var width = this.element.clientWidth;
        var newWidth = width + (movementX || 0);
        this.prevScreenX = event.screenX;
        var overMinWidth = !this.minWidth || newWidth >= this.minWidth;
        var underMaxWidth = !this.maxWidth || newWidth <= this.maxWidth;
        if (overMinWidth && underMaxWidth) {
            this.element.style.width = newWidth + "px";
        }
    };
    __decorate([
        Input(), 
        __metadata('design:type', Boolean)
    ], Resizeable.prototype, "resizeEnabled", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], Resizeable.prototype, "minWidth", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], Resizeable.prototype, "maxWidth", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], Resizeable.prototype, "onResize", void 0);
    __decorate([
        HostListener('document:mouseup', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Resizeable.prototype, "onMouseup", null);
    __decorate([
        HostListener('mousedown', ['$event']), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object]), 
        __metadata('design:returntype', void 0)
    ], Resizeable.prototype, "onMousedown", null);
    Resizeable = __decorate([
        Directive({
            selector: '[resizeable]',
            host: {
                '[class.resizeable]': 'resizeEnabled'
            }
        }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _b) || Object])
    ], Resizeable);
    return Resizeable;
    var _a, _b;
}());

var Orderable = (function () {
    function Orderable() {
        this.onReorder = new EventEmitter();
    }
    Orderable.prototype.ngAfterContentInit = function () {
        var _this = this;
        this.drags.forEach(function (d) {
            return d.onDragStart.subscribe(_this.onDragStart.bind(_this)) &&
                d.onDragEnd.subscribe(_this.onDragEnd.bind(_this));
        });
    };
    Orderable.prototype.onDragStart = function () {
        this.positions = {};
        var i = 0;
        for (var _i = 0, _a = this.drags.toArray(); _i < _a.length; _i++) {
            var dragger = _a[_i];
            var elm = dragger.element;
            this.positions[dragger.model.prop] = {
                left: parseInt(elm.offsetLeft.toString()),
                index: i++
            };
        }
    };
    Orderable.prototype.onDragEnd = function (_a) {
        var element = _a.element, model = _a.model;
        var newPos = parseInt(element.offsetLeft.toString());
        var prevPos = this.positions[model.prop];
        var i = 0;
        for (var prop in this.positions) {
            var pos = this.positions[prop];
            var movedLeft = newPos < pos.left && prevPos.left > pos.left;
            var movedRight = newPos > pos.left && prevPos.left < pos.left;
            if (movedLeft || movedRight) {
                this.onReorder.emit({
                    prevIndex: prevPos.index,
                    newIndex: i,
                    model: model
                });
            }
            i++;
        }
        element.style.left = 'auto';
    };
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], Orderable.prototype, "onReorder", void 0);
    __decorate([
        ContentChildren(Draggable), 
        __metadata('design:type', (typeof (_b = typeof QueryList !== 'undefined' && QueryList) === 'function' && _b) || Object)
    ], Orderable.prototype, "drags", void 0);
    Orderable = __decorate([
        Directive({ selector: '[orderable]' }), 
        __metadata('design:paramtypes', [])
    ], Orderable);
    return Orderable;
    var _a, _b;
}());

var DataTableHeaderCell = (function () {
    function DataTableHeaderCell(element, state) {
        this.element = element;
        this.state = state;
        this.onColumnChange = new EventEmitter();
        element.nativeElement.classList.add('datatable-header-cell');
    }
    Object.defineProperty(DataTableHeaderCell.prototype, "sortDir", {
        get: function () {
            var _this = this;
            var sort = this.state.options.sorts.find(function (s) {
                return s.prop === _this.model.prop;
            });
            if (sort)
                return sort.dir;
        },
        enumerable: true,
        configurable: true
    });
    DataTableHeaderCell.prototype.sortClasses = function (sort) {
        var dir = this.sortDir;
        return {
            'sort-asc icon-down': dir === SortDirection.asc,
            'sort-desc icon-up': dir === SortDirection.desc
        };
    };
    DataTableHeaderCell.prototype.onSort = function () {
        if (this.model.sortable) {
            this.state.nextSort(this.model);
            this.onColumnChange.emit({
                type: 'sort',
                value: this.model
            });
        }
    };
    __decorate([
        Input(), 
        __metadata('design:type', (typeof (_a = typeof TableColumn !== 'undefined' && TableColumn) === 'function' && _a) || Object)
    ], DataTableHeaderCell.prototype, "model", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_b = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _b) || Object)
    ], DataTableHeaderCell.prototype, "onColumnChange", void 0);
    DataTableHeaderCell = __decorate([
        Component({
            selector: 'datatable-header-cell',
            template: "\n\t <div>\n      <span\n        class=\"datatable-header-cell-label draggable\"\n        (click)=\"onSort()\"\n        [innerHTML]=\"model.name\">\n      </span>\n      <span\n        class=\"sort-btn\"\n        [ngClass]=\"sortClasses()\">\n      </span>\n    </div>\n  ",
            host: {
                '[class.sortable]': 'model.sortable',
                '[class.resizable]': 'model.resizable',
                '[style.width]': 'model.width + "px"',
                '[style.minWidth]': 'model.minWidth + "px"',
                '[style.maxWidth]': 'model.maxWidth + "px"',
                '[style.height]': 'model.height + "px"',
                '[attr.title]': 'model.name'
            }
        }), 
        __metadata('design:paramtypes', [(typeof (_c = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _c) || Object, (typeof (_d = typeof StateService !== 'undefined' && StateService) === 'function' && _d) || Object])
    ], DataTableHeaderCell);
    return DataTableHeaderCell;
    var _a, _b, _c, _d;
}());

var DataTableHeader = (function () {
    function DataTableHeader(state, elm) {
        this.state = state;
        this.onColumnChange = new EventEmitter();
        elm.nativeElement.classList.add('datatable-header');
    }
    Object.defineProperty(DataTableHeader.prototype, "headerWidth", {
        get: function () {
            if (this.state.options.scrollbarH)
                return this.state.innerWidth + 'px';
            return '100%';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableHeader.prototype, "headerHeight", {
        get: function () {
            var height = this.state.options.headerHeight;
            if (height !== 'auto')
                return height + "px";
            return height;
        },
        enumerable: true,
        configurable: true
    });
    DataTableHeader.prototype.columnResized = function (width, column) {
        if (width <= column.minWidth) {
            width = column.minWidth;
        }
        else if (width >= column.maxWidth) {
            width = column.maxWidth;
        }
        column.width = width;
        this.onColumnChange.emit({
            type: 'resize',
            value: column
        });
    };
    DataTableHeader.prototype.columnReordered = function (_a) {
        var prevIndex = _a.prevIndex, newIndex = _a.newIndex, model = _a.model;
        this.state.options.columns.splice(prevIndex, 1);
        this.state.options.columns.splice(newIndex, 0, model);
        this.onColumnChange.emit({
            type: 'reorder',
            value: model
        });
    };
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], DataTableHeader.prototype, "onColumnChange", void 0);
    DataTableHeader = __decorate([
        Component({
            selector: 'datatable-header',
            template: "\n  \t<div\n      [style.width]=\"state.columnGroupWidths.total\"\n      [style.left]=\"-state.HScrollPos + 'px'\"\n      class=\"datatable-header-inner\"\n      orderable\n      (onReorder)=\"columnReordered($event)\">\n      <div\n        class=\"datatable-row-left\"\n        [style.width]=\"state.columnGroupWidths.left + 'px'\"\n        *ngIf=\"state.columnsByPin.left.length\">\n        <datatable-header-cell\n          *ngFor=\"let column of state.columnsByPin.left\"\n          resizeable\n          [resizeEnabled]=\"column.resizeable\"\n          (onResize)=\"columnResized($event, column)\"\n          long-press\n          (onLongPress)=\"drag = true\"\n          (onLongPressEnd)=\"drag = false\"\n          draggable\n          [dragX]=\"column.draggable && drag\"\n          [dragY]=\"false\"\n          [model]=\"column\"\n          (onColumnChange)=\"onColumnChange.emit($event)\">\n        </datatable-header-cell>\n      </div>\n      <div\n        class=\"datatable-row-center\"\n        [style.width]=\"state.columnGroupWidths.center + 'px'\"\n        *ngIf=\"state.columnsByPin.center.length\">\n        <datatable-header-cell\n          *ngFor=\"let column of state.columnsByPin.center\"\n          resizeable\n          [resizeEnabled]=\"column.resizeable\"\n          (onResize)=\"columnResized($event, column)\"\n          long-press\n          (onLongPress)=\"drag = true\"\n          (onLongPressEnd)=\"drag = false\"\n          draggable\n          [dragX]=\"column.draggable && drag\"\n          [dragY]=\"false\"\n          [model]=\"column\"\n          (onColumnChange)=\"onColumnChange.emit($event)\">\n        </datatable-header-cell>\n      </div>\n      <div\n        class=\"datatable-row-right\"\n        [style.width]=\"state.columnGroupWidths.right + 'px'\"\n        *ngIf=\"state.columnsByPin.right.length\">\n        <datatable-header-cell\n          *ngFor=\"let column of state.columnsByPin.right\"\n          resizeable\n          [resizeEnabled]=\"column.resizeable\"\n          (onResize)=\"columnResized($event, column)\"\n          long-press\n          (onLongPress)=\"drag = true\"\n          (onLongPressEnd)=\"drag = false\"\n          draggable\n          [dragX]=\"column.draggable && drag\"\n          [dragY]=\"false\"\n          [model]=\"column\"\n          (onColumnChange)=\"onColumnChange.emit($event)\">\n        </datatable-header-cell>\n      </div>\n    </div>\n  ",
            directives: [
                DataTableHeaderCell,
                Draggable,
                Resizeable,
                Orderable,
                LongPress
            ],
            host: {
                '[style.width]': 'headerWidth',
                '[style.height]': 'headerHeight'
            }
        }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof StateService !== 'undefined' && StateService) === 'function' && _b) || Object, (typeof (_c = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _c) || Object])
    ], DataTableHeader);
    return DataTableHeader;
    var _a, _b, _c;
}());

var SelectionType;
(function (SelectionType) {
    SelectionType[SelectionType["single"] = 'single'] = "single";
    SelectionType[SelectionType["multi"] = 'multi'] = "multi";
    SelectionType[SelectionType["multiShift"] = 'multiShift'] = "multiShift";
})(SelectionType || (SelectionType = {}));

var Keys;
(function (Keys) {
    Keys[Keys["up"] = 38] = "up";
    Keys[Keys["down"] = 40] = "down";
    Keys[Keys["return"] = 13] = "return";
    Keys[Keys["escape"] = 27] = "escape";
})(Keys || (Keys = {}));

function selectRows(selected, row) {
    var selectedIndex = selected.indexOf(row);
    if (selectedIndex > -1) {
        selected.splice(selectedIndex, 1);
    }
    else {
        selected.push(row);
    }
    return selected;
}
function selectRowsBetween(selected, rows, index, prevIndex) {
    var reverse = index < prevIndex;
    for (var i = 0, len = rows.length; i < len; i++) {
        var row = rows[i];
        var greater = i >= prevIndex && i <= index;
        var lesser = i <= prevIndex && i >= index;
        var range = { start: 0, end: 0 };
        if (reverse) {
            range = {
                start: index,
                end: (prevIndex - index)
            };
        }
        else {
            range = {
                start: prevIndex,
                end: index + 1
            };
        }
        if ((reverse && lesser) || (!reverse && greater)) {
            var idx = selected.indexOf(row);
            if (reverse && idx > -1) {
                selected.splice(idx, 1);
                continue;
            }
            if (i >= range.start && i < range.end) {
                if (idx === -1) {
                    selected.push(row);
                }
            }
        }
    }
    return selected;
}

var ProgressBar = (function () {
    function ProgressBar() {
    }
    ProgressBar = __decorate([
        Component({
            selector: 'datatable-progress',
            template: "\n    <div\n      class=\"progress-linear\"\n      role=\"progressbar\">\n      <div class=\"container\">\n        <div class=\"bar\"></div>\n      </div>\n    </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], ProgressBar);
    return ProgressBar;
}());

function deepValueGetter(obj, path) {
    if (!obj || !path)
        return obj;
    var current = obj;
    var split = path.split('.');
    if (split.length) {
        for (var i = 0, len = split.length; i < len; i++) {
            current = current[split[i]];
        }
    }
    return current;
}
;

var TemplateWrapper = (function () {
    function TemplateWrapper(viewContainer) {
        this.viewContainer = viewContainer;
    }
    TemplateWrapper.prototype.ngOnChanges = function (changes) {
        if (changes['templateWrapper']) {
            if (this.embeddedViewRef) {
                this.embeddedViewRef.destroy();
            }
            this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.templateWrapper, {
                value: this.value,
                row: this.row,
                column: this.column
            });
        }
        if (this.embeddedViewRef) {
            this.embeddedViewRef.context.value = this.value;
            this.embeddedViewRef.context.row = this.row;
            this.embeddedViewRef.context.column = this.column;
        }
    };
    __decorate([
        Input(), 
        __metadata('design:type', (typeof (_a = typeof TemplateRef !== 'undefined' && TemplateRef) === 'function' && _a) || Object)
    ], TemplateWrapper.prototype, "templateWrapper", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], TemplateWrapper.prototype, "value", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], TemplateWrapper.prototype, "row", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], TemplateWrapper.prototype, "column", void 0);
    TemplateWrapper = __decorate([
        Directive({ selector: '[templateWrapper]' }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof ViewContainerRef !== 'undefined' && ViewContainerRef) === 'function' && _b) || Object])
    ], TemplateWrapper);
    return TemplateWrapper;
    var _a, _b;
}());

var DataTableBodyCell = (function () {
    function DataTableBodyCell(elm, viewContainerRef, componentResolver) {
        this.elm = elm;
        this.viewContainerRef = viewContainerRef;
        this.componentResolver = componentResolver;
        elm.nativeElement.classList.add('datatable-body-cell');
    }
    Object.defineProperty(DataTableBodyCell.prototype, "value", {
        get: function () {
            if (!this.row)
                return '';
            return deepValueGetter(this.row, this.column.prop);
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        Input(), 
        __metadata('design:type', (typeof (_a = typeof TableColumn !== 'undefined' && TableColumn) === 'function' && _a) || Object)
    ], DataTableBodyCell.prototype, "column", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DataTableBodyCell.prototype, "row", void 0);
    DataTableBodyCell = __decorate([
        Component({
            selector: 'datatable-body-cell',
            template: "\n  \t<div class=\"datatable-body-cell-label\">\n      <span\n        *ngIf=\"!column.template\"\n        [innerHTML]=\"value\">\n      </span>\n      <template\n        *ngIf=\"column.template\"\n        [value]=\"value\"\n        [row]=\"row\"\n        [column]=\"column\"\n        [templateWrapper]=\"column.template\">\n      </template>\n    </div>\n  ",
            host: {
                '[style.width]': 'column.width + "px"',
                '[style.height]': 'column.height + "px"'
            },
            directives: [TemplateWrapper]
        }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _b) || Object, (typeof (_c = typeof ViewContainerRef !== 'undefined' && ViewContainerRef) === 'function' && _c) || Object, (typeof (_d = typeof ComponentResolver !== 'undefined' && ComponentResolver) === 'function' && _d) || Object])
    ], DataTableBodyCell);
    return DataTableBodyCell;
    var _a, _b, _c, _d;
}());

var DataTableBodyRow = (function () {
    function DataTableBodyRow(state, elm) {
        this.state = state;
        elm.nativeElement.classList.add('datatable-body-row');
    }
    Object.defineProperty(DataTableBodyRow.prototype, "isSelected", {
        get: function () {
            return this.state.selected &&
                this.state.selected.indexOf(this.row) > -1;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DataTableBodyRow.prototype, "row", void 0);
    DataTableBodyRow = __decorate([
        Component({
            selector: 'datatable-body-row',
            template: "\n  \t<div>\n      <div\n        class=\"datatable-row-left\"\n        *ngIf=\"state.columnsByPin.left.length\"\n        [style.width]=\"state.columnGroupWidths.left + 'px'\">\n        <datatable-body-cell\n          *ngFor=\"let column of state.columnsByPin.left\"\n          [row]=\"row\"\n          [column]=\"column\">\n        </datatable-body-cell>\n      </div>\n      <div\n        class=\"datatable-row-center\"\n        [style.width]=\"state.columnGroupWidths.center + 'px'\"\n        *ngIf=\"state.columnsByPin.center.length\">\n        <datatable-body-cell\n          *ngFor=\"let column of state.columnsByPin.center\"\n          [row]=\"row\"\n          [column]=\"column\">\n        </datatable-body-cell>\n      </div>\n      <div\n        class=\"datatable-row-right\"\n        *ngIf=\"state.columnsByPin.right.length\"\n        [style.width]=\"state.columnGroupWidths.right + 'px'\">\n        <datatable-body-cell\n          *ngFor=\"let column of state.columnsByPin.right\"\n          [row]=\"row\"\n          [column]=\"column\">\n        </datatable-body-cell>\n      </div>\n    </div>\n  ",
            directives: [DataTableBodyCell],
            host: {
                '[class.active]': 'isSelected'
            }
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof StateService !== 'undefined' && StateService) === 'function' && _a) || Object, (typeof (_b = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _b) || Object])
    ], DataTableBodyRow);
    return DataTableBodyRow;
    var _a, _b;
}());

var Scroller = (function () {
    function Scroller(elm) {
        elm.nativeElement.classList.add('scroller');
    }
    Object.defineProperty(Scroller.prototype, "scrollHeight", {
        get: function () {
            return (this.count * this.rowHeight) + 'px';
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], Scroller.prototype, "rowHeight", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], Scroller.prototype, "count", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], Scroller.prototype, "scrollWidth", void 0);
    Scroller = __decorate([
        Directive({
            selector: '[scroller]',
            host: {
                '[style.height]': 'scrollHeight',
                '[style.width]': 'scrollWidth + "px"'
            }
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _a) || Object])
    ], Scroller);
    return Scroller;
    var _a;
}());

var DataTableBody = (function () {
    function DataTableBody(state, elm) {
        this.state = state;
        this.onRowClick = new EventEmitter();
        this.onRowSelect = new EventEmitter();
        elm.nativeElement.classList.add('datatable-body');
    }
    Object.defineProperty(DataTableBody.prototype, "selectEnabled", {
        get: function () {
            return this.state.options.selectionType !== undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBody.prototype, "bodyHeight", {
        get: function () {
            if (this.state.options.scrollbarV)
                return this.state.bodyHeight + 'px';
            return 'auto';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBody.prototype, "bodyWidth", {
        get: function () {
            if (this.state.options.scrollbarH)
                return this.state.innerWidth + 'px';
            return '100%';
        },
        enumerable: true,
        configurable: true
    });
    DataTableBody.prototype.ngOnInit = function () {
        var _this = this;
        this.rows = this.state.rows.slice();
        this.state.onPageChange.subscribe(function (page) {
            var _a = _this.state.indexes, first = _a.first, last = _a.last;
            _this.rows = _this.state.rows.slice(first, last);
            _this.hideIndicator();
        });
        this.state.onRowsUpdate.subscribe(function (rows) {
            var _a = _this.state.indexes, first = _a.first, last = _a.last;
            _this.rows = rows.slice(first, last);
            _this.hideIndicator();
        });
    };
    DataTableBody.prototype.hideIndicator = function () {
        var _this = this;
        setTimeout(function () {
            _this.state.options.loadingIndicator = false;
        }, 500);
    };
    DataTableBody.prototype.rowClicked = function (event, index, row) {
        this.onRowClick.emit({ event: event, row: row });
        this.selectRow(event, index, row);
    };
    DataTableBody.prototype.onScroll = function (event) {
        if (this.state.options.scrollbarH) {
            this.state.HScrollPos = event.target.scrollLeft;
        }
    };
    DataTableBody.prototype.rowKeydown = function (event, index, row) {
        if (event.keyCode === Keys.return && this.selectEnabled) {
            this.selectRow(event, index, row);
        }
        else if (event.keyCode === Keys.up || event.keyCode === Keys.down) {
            var dom = event.keyCode === Keys.up ?
                event.target.previousElementSibling :
                event.target.nextElementSibling;
            if (dom)
                dom.focus();
        }
    };
    DataTableBody.prototype.selectRow = function (event, index, row) {
        if (!this.selectEnabled)
            return;
        var multiShift = this.state.options.selectionType === SelectionType.multiShift;
        var multiClick = this.state.options.selectionType === SelectionType.multi;
        var selections = [];
        if (multiShift || multiClick) {
            if (multiShift && event.shiftKey) {
                var selected = this.state.selected.slice();
                selections = selectRowsBetween(selected, this.rows, index, this.prevIndex);
            }
            else if (multiShift && !event.shiftKey) {
                selections.push(row);
            }
            else {
                var selected = this.state.selected.slice();
                selections = selectRows(selected, row);
            }
        }
        else {
            selections.push(row);
        }
        this.prevIndex = index;
        this.onRowSelect.emit(selections);
    };
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], DataTableBody.prototype, "onRowClick", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_b = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _b) || Object)
    ], DataTableBody.prototype, "onRowSelect", void 0);
    DataTableBody = __decorate([
        Component({
            selector: 'datatable-body',
            template: "\n    <div>\n      <datatable-progress\n        [hidden]=\"!state.options.loadingIndicator\">\n      </datatable-progress>\n      <div\n        scroller\n        *ngIf=\"state.rows.length\"\n        [rowHeight]=\"state.options.rowHeight\"\n        [count]=\"state.rowCount\"\n        [scrollWidth]=\"state.columnGroupWidths.total\">\n        <datatable-body-row\n          *ngFor=\"let row of rows; let i = index;\"\n          [attr.tabindex]=\"i\"\n          (click)=\"rowClicked($event, i, row)\"\n          (keydown)=\"rowKeydown($event, i, row)\"\n          [row]=\"row\">\n        </datatable-body-row>\n      </div>\n      <div\n        class=\"empty-row\"\n        *ngIf=\"!rows.length\"\n        [innerHTML]=\"state.options.emptyMessage\">\n      </div>\n    </div>\n  ",
            directives: [
                ProgressBar,
                DataTableBodyRow,
                Scroller
            ],
            host: {
                '[style.width]': 'bodyWidth',
                '[style.height]': 'bodyHeight',
                '(scroll)': 'onScroll($event)',
            }
        }), 
        __metadata('design:paramtypes', [(typeof (_c = typeof StateService !== 'undefined' && StateService) === 'function' && _c) || Object, (typeof (_d = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _d) || Object])
    ], DataTableBody);
    return DataTableBody;
    var _a, _b, _c, _d;
}());

var DataTablePager = (function () {
    function DataTablePager(elm) {
        this.size = 0;
        this.onPaged = new EventEmitter();
        elm.nativeElement.classList.add('datatable-pager');
    }
    Object.defineProperty(DataTablePager.prototype, "totalPages", {
        get: function () {
            var count = this.size < 1 ? 1 : Math.ceil(this.count / this.size);
            return Math.max(count || 0, 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTablePager.prototype, "count", {
        get: function () {
            return this._count;
        },
        set: function (val) {
            this._count = val;
            this.pages = this.calcPages();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTablePager.prototype, "page", {
        get: function () {
            return this._page;
        },
        set: function (val) {
            this._page = val;
            this.pages = this.calcPages();
        },
        enumerable: true,
        configurable: true
    });
    DataTablePager.prototype.canPrevious = function () {
        return this.page > 1;
    };
    DataTablePager.prototype.canNext = function () {
        return this.page < this.totalPages;
    };
    DataTablePager.prototype.prevPage = function () {
        if (this.page > 1) {
            this.selectPage(--this.page);
        }
    };
    DataTablePager.prototype.nextPage = function () {
        this.selectPage(++this.page);
    };
    DataTablePager.prototype.selectPage = function (page) {
        if (page > 0 && page <= this.totalPages) {
            this.page = page;
            this.onPaged.emit(page);
        }
    };
    DataTablePager.prototype.calcPages = function (page) {
        var pages = [];
        var startPage = 1;
        var endPage = this.totalPages;
        var maxSize = 5;
        var isMaxSized = maxSize < this.totalPages;
        page = page || this.page;
        if (isMaxSized) {
            startPage = ((Math.ceil(page / maxSize) - 1) * maxSize) + 1;
            endPage = Math.min(startPage + maxSize - 1, this.totalPages);
        }
        for (var num = startPage; num <= endPage; num++) {
            pages.push({
                number: num,
                text: num
            });
        }
        return pages;
    };
    __decorate([
        Input(), 
        __metadata('design:type', Number)
    ], DataTablePager.prototype, "size", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], DataTablePager.prototype, "onPaged", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], DataTablePager.prototype, "count", null);
    __decorate([
        Input(), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], DataTablePager.prototype, "page", null);
    DataTablePager = __decorate([
        Component({
            selector: 'datatable-pager',
            template: "\n    <ul class=\"pager\">\n      <li [class.disabled]=\"!canPrevious()\">\n        <a\n          href=\"javascript:void(0)\"\n          (click)=\"selectPage(1)\"\n          class=\"icon-prev\">\n        </a>\n      </li>\n      <li [class.disabled]=\"!canPrevious()\">\n        <a\n          href=\"javascript:void(0)\"\n          (click)=\"prevPage()\"\n          class=\"icon-left\">\n        </a>\n      </li>\n      <li\n        *ngFor=\"let pg of pages\"\n        [class.active]=\"pg.number === page\">\n        <a\n          href=\"javascript:void(0)\"\n          (click)=\"selectPage(pg.number)\">\n          {{pg.text}}\n        </a>\n      </li>\n      <li [class.disabled]=\"!canNext()\">\n        <a\n          href=\"javascript:void(0)\"\n          (click)=\"nextPage()\"\n          class=\"icon-right\">\n        </a>\n      </li>\n      <li [class.disabled]=\"!canNext()\">\n        <a\n          href=\"javascript:void(0)\"\n          (click)=\"selectPage(totalPages)\"\n          class=\"icon-skip\">\n        </a>\n      </li>\n    </ul>\n  "
        }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _b) || Object])
    ], DataTablePager);
    return DataTablePager;
    var _a, _b;
}());

var DataTableFooter = (function () {
    function DataTableFooter(elm, state) {
        this.state = state;
        this.onPageChange = new EventEmitter();
        elm.nativeElement.classList.add('datatable-footer');
    }
    Object.defineProperty(DataTableFooter.prototype, "visible", {
        get: function () {
            return (this.state.pageCount / this.state.pageSize) > 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableFooter.prototype, "curPage", {
        get: function () {
            return this.state.options.offset + 1;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_a = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _a) || Object)
    ], DataTableFooter.prototype, "onPageChange", void 0);
    DataTableFooter = __decorate([
        Component({
            selector: 'datatable-footer',
            template: "\n    <div\n      *ngIf=\"state.options.footerHeight\"\n      [style.height]=\"state.options.footerHeight\">\n      <div class=\"page-count\">{{state.pageCount}} total</div>\n      <datatable-pager\n        [page]=\"curPage\"\n        [size]=\"state.pageSize\"\n        (onPaged)=\"onPageChange.emit($event)\"\n        [count]=\"state.pageCount\"\n        [hidden]=\"!visible\">\n       </datatable-pager>\n     </div>\n  ",
            directives: [DataTablePager]
        }), 
        __metadata('design:paramtypes', [(typeof (_b = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _b) || Object, (typeof (_c = typeof StateService !== 'undefined' && StateService) === 'function' && _c) || Object])
    ], DataTableFooter);
    return DataTableFooter;
    var _a, _b, _c;
}());

var DataTable = (function () {
    function DataTable(element, state, differs) {
        this.state = state;
        this.onPageChange = new EventEmitter();
        this.onRowsUpdate = new EventEmitter();
        this.onRowClick = new EventEmitter();
        this.onSelectionChange = new EventEmitter();
        this.onColumnChange = new EventEmitter();
        this.element = element.nativeElement;
        this.element.classList.add('datatable');
        this.rowDiffer = differs.find({}).create(null);
        this.colDiffer = differs.find({}).create(null);
    }
    DataTable.prototype.ngOnInit = function () {
        var _a = this, options = _a.options, rows = _a.rows, selected = _a.selected;
        this.state
            .setOptions(options)
            .setRows(rows)
            .setSelected(selected);
    };
    DataTable.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.adjustColumns();
        setTimeout(function () {
            for (var _i = 0, _a = _this.columns.toArray(); _i < _a.length; _i++) {
                var col = _a[_i];
                _this.options.columns.push(new TableColumn(col));
            }
        });
    };
    DataTable.prototype.ngDoCheck = function () {
        if (this.rowDiffer.diff(this.rows)) {
            this.state.setRows(this.rows);
            this.onRowsUpdate.emit(this.rows);
        }
        this.checkColumnToggles();
    };
    DataTable.prototype.checkColumnToggles = function () {
        var colDiff = this.colDiffer.diff(this.options.columns);
        if (colDiff) {
            var chngd_1 = false;
            colDiff.forEachAddedItem(function (c) {
                chngd_1 = true;
                return false;
            });
            if (!chngd_1) {
                colDiff.forEachRemovedItem(function (c) {
                    chngd_1 = true;
                    return false;
                });
            }
            if (chngd_1)
                this.adjustColumns();
        }
    };
    DataTable.prototype.adjustSizes = function () {
        var _a = this.element.getBoundingClientRect(), height = _a.height, width = _a.width;
        this.state.innerWidth = Math.floor(width);
        if (this.options.scrollbarV) {
            if (this.options.headerHeight)
                height = -this.options.headerHeight;
            if (this.options.footerHeight)
                height = -this.options.footerHeight;
            this.state.bodyHeight = height;
        }
        this.adjustColumns();
    };
    DataTable.prototype.resize = function () { this.adjustSizes(); };
    DataTable.prototype.adjustColumns = function (forceIdx) {
        if (!this.options.columns)
            return;
        var width = this.state.innerWidth;
        if (this.options.scrollbarV) {
            width = -this.state.scrollbarWidth;
        }
        if (this.options.columnMode === ColumnMode.force) {
            forceFillColumnWidths(this.options.columns, width, forceIdx);
        }
        else if (this.options.columnMode === ColumnMode.flex) {
            adjustColumnWidths(this.options.columns, width);
        }
    };
    DataTable.prototype.onPageChanged = function (event) {
        this.state.setPage(event);
        this.onPageChange.emit(event);
    };
    DataTable.prototype.onRowSelect = function (event) {
        this.state.setSelected(event);
        this.onSelectionChange.emit(event);
    };
    __decorate([
        Input(), 
        __metadata('design:type', (typeof (_a = typeof TableOptions !== 'undefined' && TableOptions) === 'function' && _a) || Object)
    ], DataTable.prototype, "options", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DataTable.prototype, "rows", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DataTable.prototype, "selected", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_b = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _b) || Object)
    ], DataTable.prototype, "onPageChange", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_c = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _c) || Object)
    ], DataTable.prototype, "onRowsUpdate", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_d = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _d) || Object)
    ], DataTable.prototype, "onRowClick", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_e = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _e) || Object)
    ], DataTable.prototype, "onSelectionChange", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', (typeof (_f = typeof EventEmitter !== 'undefined' && EventEmitter) === 'function' && _f) || Object)
    ], DataTable.prototype, "onColumnChange", void 0);
    __decorate([
        ContentChildren(DataTableColumn), 
        __metadata('design:type', Object)
    ], DataTable.prototype, "columns", void 0);
    __decorate([
        HostListener('window:resize'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], DataTable.prototype, "resize", null);
    DataTable = __decorate([
        Component({
            selector: 'datatable',
            template: "\n  \t<div\n      visibility-observer\n      (onVisibilityChange)=\"adjustSizes()\">\n      <datatable-header\n        (onColumnChange)=\"onColumnChange.emit($event)\">\n      </datatable-header>\n      <datatable-body\n        (onRowClick)=\"onRowClick.emit($event)\"\n        (onRowSelect)=\"onRowSelect($event)\">\n      </datatable-body>\n      <datatable-footer\n        (onPageChange)=\"onPageChanged($event)\">\n      </datatable-footer>\n    </div>\n  ",
            directives: [
                DataTableHeader,
                DataTableBody,
                DataTableFooter,
                Visibility
            ],
            host: {
                '[class.fixed-header]': 'options.headerHeight !== "auto"',
                '[class.fixed-row]': 'options.rowHeight !== "auto"',
                '[class.scroll-vertical]': 'options.scrollbarV',
                '[class.scroll-horz]': 'options.scrollbarH',
                '[class.selectable]': 'options.selectable',
                '[class.checkboxable]': 'options.checkboxable'
            },
            providers: [StateService]
        }), 
        __metadata('design:paramtypes', [(typeof (_g = typeof ElementRef !== 'undefined' && ElementRef) === 'function' && _g) || Object, (typeof (_h = typeof StateService !== 'undefined' && StateService) === 'function' && _h) || Object, (typeof (_j = typeof KeyValueDiffers !== 'undefined' && KeyValueDiffers) === 'function' && _j) || Object])
    ], DataTable);
    return DataTable;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
}());

var DATATABLE_COMPONENTS = [
    DataTable,
    DataTableColumn
];

export { DataTable, TableOptions, TableColumn, Sort, SelectionType, ColumnMode, SortDirection, SortType, DATATABLE_COMPONENTS };
//# sourceMappingURL=angular2-data-table.es.js.map
