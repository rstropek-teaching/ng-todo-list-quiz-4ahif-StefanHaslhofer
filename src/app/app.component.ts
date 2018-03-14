import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  private itemList: Observable<ITodoItem[]>;
  private personList: Observable<IPerson[]>;

  private editTask:boolean=true;
  private currentEditItem:any;

  private httpClient: HttpClient;
  private columns: string[] = ['id', 'assignedTo', 'description', 'done', 'options'];

  constructor(private http: HttpClient) {
    this.httpClient = http;
    this.loadList();
  }

  loadList() {
    this.itemList = this.httpClient.get<ITodoItem[]>('http://localhost:8080/api/todos');
    this.personList = this.httpClient.get<IPerson[]>('http://localhost:8080/api/people');
  }

  getEditTask():boolean{
    return this.editTask;
  }

  getCurrentEditItemDescription():string{
    if(this.currentEditItem!=null){
      return this.currentEditItem.description;      
    }
    return '';
  }

  getCurrentEditItemPerson():string{
    if(this.currentEditItem!=null){
      return this.currentEditItem.assignedTo;      
    }
    return '';
  }

  toggleEditTask(item:ITodoItem){
    this.editTask=!this.editTask;
    this.currentEditItem=item;
  }

  addItem(description: string, assignedTo: string) {
    if (assignedTo != 'Nobody' && description) {
      this.httpClient.post<ITodoItem>('http://localhost:8080/api/todos', {
        'description': description,
        'assignedTo': assignedTo
      }).subscribe(
        (val) => {
          console.log("Insert successful", val);
          this.loadList();
        }
        );
    } else {
      if (description) {
        this.httpClient.post<ITodoItem>('http://localhost:8080/api/todos', {
          'description': description,
          'assignedTo': 'Nobody'
        }).subscribe(
          (val) => {
            console.log("Insert successful", val);
            this.loadList();
          }
          );
      }
    }
  }

  toggleDone(item: ITodoItem) { //When box is clicked --> update done flag
    console.log(item.id);
    if (item.done === false || item.done == null) {
      this.httpClient.patch<ITodoItem>('http://localhost:8080/api/todos/' + item.id, {
        'done': true
      }).subscribe(
        (val) => {
          console.log("Patch successful", val);
        }
        );
    } else {
      this.httpClient.patch<ITodoItem>('http://localhost:8080/api/todos/' + item.id, {
        'done': false
      }).subscribe(
        (val) => {
          console.log("Patch successful", val);
        }
        );
    }
  }

  checkDone(item: ITodoItem) { //When page is loaded --> check if item is set on done
    return item.done;
  }

  // Filters 
  showUndone() {
    this.itemList = this.itemList.map(items => items.filter(item => item.done === false || item.done == null));
  }

  filterPerson(currentPerson: any) {
    this.loadList();
    if (currentPerson === 'Nobody') {
      this.itemList = this.itemList.map(items => items.filter(item => item.assignedTo == ''));
    } else {
      this.itemList = this.itemList.map(items => items.filter(item => item.assignedTo == currentPerson));

    }
  }

  deleteItem(item: ITodoItem) {
    //delete and reload list
    this.httpClient.delete<ITodoItem>('http://localhost:8080/api/todos/' + item.id).subscribe(
      (val) => {
        console.log("Delete successful", val);
        this.loadList();
      }
    );
  }

  editItem(description: string, assignedTo: string) {
    this.httpClient.patch<ITodoItem>('http://localhost:8080/api/todos/' + this.currentEditItem.id, {
      'description': description,
      'assignedTo': assignedTo
    }).subscribe(
      (val) => {
        console.log("Edit successful", val);
        this.toggleEditTask(val);
        this.loadList();
      }
      );
  }
}

interface IPerson {
  name: string;
}

interface ITodoItem {
  id: number;
  assignedTo?: string;
  description: string;
  done?: boolean;
}