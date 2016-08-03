import { Injectable, EventEmitter } from '@angular/core';

import { columnsByPin, columnGroupWidths } from '../utils/column';
import { scrollbarWidth } from '../utils/scrollbarWidth';
import { nextSortDir, sortRows } from '../utils/sort';

import { TableOptions } from '../models/TableOptions';
import { TableColumn } from '../models/TableColumn';
import { Sort } from '../models/Sort';
import { SortType } from '../enums/SortType';

@Injectable()
export class StateService {

  options: TableOptions;
  rows: Array<any>;
  selected: Array<any>;

  onSelectionChange: EventEmitter<any> = new EventEmitter();
  onRowsUpdate: EventEmitter<any> = new EventEmitter();
  onPageChange: EventEmitter<any> = new EventEmitter();

  scrollbarWidth: number = scrollbarWidth();
  offsetX: number = 0;
  offsetY: number = 0;
  innerWidth: number = 0;
  bodyHeight: number = 300;
  HScrollPos: number = 0;

  get columnsByPin() {
    return columnsByPin(this.options.columns);
  }

  get columnGroupWidths() {
    return columnGroupWidths(this.columnsByPin, this.options.columns);
  }

  get pageCount() {
    if(!this.options.externalPaging) {
      return this.rows.length;
    } else {
      return this.options.count;
    }
  }

  get pageSize() {
    // if(this.options.scrollbarV) {
    //   console.log('cc', this.bodyHeight, this.options.rowHeight);
    //   return Math.ceil(this.bodyHeight / this.options.rowHeight) + 1;
    // } else if(this.options.limit) {
    if(this.options.limit) {
      return this.options.limit;
    } else {
      return this.rows.length;
    }
  }

  get indexes() {
    let first = 0;
    let last = 0;

    if(this.options.scrollbarV) {
      const floor = Math.floor((this.offsetY || 0) / this.options.rowHeight);
      first = Math.max(floor, 0);
      last = Math.min(first + this.pageSize, this.pageCount);
      // console.log('dd', first, last, this.pageSize, this.pageCount);
    } else {
      // first = Math.max(this.options.offset * this.pageSize, 0);
      first = 0;
      last = Math.min(first + this.pageSize, this.pageCount);
    }

    return { first, last };
  }

  setSelected(selected: Array<any>) {
    if(!this.selected) {
      this.selected = selected || [];
    } else {
      this.selected.splice(0, this.selected.length);
      this.selected.push(...selected);
    }

    this.onSelectionChange.emit(this.selected);
    return this;
  }

  setRows(rows: Array<any>) {
    if(rows) {
      this.rows = [...rows];
      this.onRowsUpdate.emit(rows);
    }
    return this;
  }

  setOptions(options: TableOptions) {
    this.options = options;
    return this;
  }

  setPage(page: number) {
    this.options.offset = page - 1;

    this.onPageChange.emit({
      offset: this.options.offset,
      limit: this.pageSize,
      count: this.pageCount
    });
  }

  nextSort(column: TableColumn) {
    const idx = this.options.sorts.findIndex(s =>
      { return s.prop === column.prop });

    let curSort = this.options.sorts[idx];
    let curDir = undefined;
    if(curSort) curDir = curSort.dir;

    const dir = nextSortDir(this.options.sortType, curDir);
    if(dir === undefined) {
      this.options.sorts.splice(idx, 1);
    } else if(curSort) {
      this.options.sorts[idx].dir = dir;
    } else {
      if(this.options.sortType === SortType.single) {
        this.options.sorts.splice(0, this.options.sorts.length);
      }

      this.options.sorts.push(new Sort({ dir, prop: column.prop }));
    }

    if(!column.comparator) {
      this.setRows(sortRows(this.rows, this.options.sorts));
    } else {
      column.comparator(this.rows, this.options.sorts)
    }
  }

}
