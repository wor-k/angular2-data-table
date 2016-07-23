import { Component } from '@angular/core';

import {
  DATATABLE_COMPONENTS,
  TableOptions,
  TableColumn,
  ColumnMode
} from '../angular2-data-table';
import '../themes/material.scss';

@Component({
  selector: 'app',
  template: `
    <div>
    	<h3>basic</h3>
    	<datatable
        class="material"
    		[rows]="rows"
    		[options]="options">
    	</datatable>
    </div>
  `,
  directives: [ DATATABLE_COMPONENTS ]
})
export class App {

	rows = [];

	options = new TableOptions({
    columnMode: ColumnMode.force,
    headerHeight: 50,
    footerHeight: 50,
    rowHeight: 'auto',
    scrollbarH: true,
    scrollbarV: true,
    columns: [
      new TableColumn({ name: "Name" }),
      new TableColumn({ name: "Gender" }),
      new TableColumn({ name: "Company" }),
      new TableColumn({ name: "Company2" }),
      new TableColumn({ name: "Company3" }),
      new TableColumn({ name: "Company4" }),
      new TableColumn({ name: "Company5" }),
      new TableColumn({ name: "Company6" }),
      new TableColumn({ name: "Company7" }),
      new TableColumn({ name: "Company8" }),
      new TableColumn({ name: "Company9" }),
      new TableColumn({ name: "Company10" }),

    ]
  });

  constructor() {
    this.fetch((data) => {
      this.rows.push(...data);
    })
  }

  fetch(cb) {
    var req = new XMLHttpRequest();
    req.open('GET', `src/demos/foo.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

}
