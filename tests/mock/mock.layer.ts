import * as _ from 'lodash';
import {IDataLayer} from '../../src/layer';
import {IHttpRequest} from '../../src/http.request';
import {IHttpResponse, HttpResponse} from '../../src/http.response';
import {IMap} from '@elium/mighty-js';

export class MockLayer<T> implements IDataLayer {
  public rows: Array<T>;

  constructor(rows: Array<T>) {
    this.rows = rows;
  }

  create(request: IHttpRequest): Promise<IHttpResponse> {
    return new Promise((resolve) => {
      const id = this._getMaxId(this.rows);
      const data = _.merge({}, request.data, {id: id + 1});
      this.rows.push(data);
      resolve(new HttpResponse({data: data}));
    });
  }


  findOne(request: IHttpRequest): Promise<IHttpResponse> {
    return new Promise((resolve) => {
      const row = _.find(this.rows, request.criteria);
      resolve(new HttpResponse({data: _.cloneDeep(row)}));
    });
  }


  find(request: IHttpRequest): Promise<IHttpResponse> {
    return new Promise((resolve) => {
      const rows = _.filter(this.rows, request.criteria);
      resolve(new HttpResponse({data: _.cloneDeep(rows)}));
    });
  }


  save(request: IHttpRequest): Promise<IHttpResponse> {
    return new Promise((resolve, reject) => {
      const index = _.findIndex(this.rows, request.criteria);
      if (index < 0) {
        reject(new HttpResponse({error: new Error("There is no match for this row criteria")}));
      } else {
        this.rows.splice(index, 1, request.data);
        resolve(new HttpResponse({data: _.cloneDeep(request.data)}));
      }
    });
  }


  destroy(request: IHttpRequest): Promise<IHttpResponse> {
    return new Promise((resolve, reject) => {
      const index = _.findIndex(this.rows, request.criteria);
      if (index < 0) {
        reject(new HttpResponse({error: new Error("There is no match for this row criteria")}));
      } else {
        const row = _.first(this.rows.splice(index, 1));
        resolve(new HttpResponse({data: row}));
      }
    });
  }


  private _getMaxId(rows: Array<IMap<any>>): number {
    const ids: Array<number> = _.map(rows, (row) => row["id"]);
    return _.max(ids);
  }
}

