import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  $textArea: BehaviorSubject<string> = new BehaviorSubject<string>('');
  showSpinner = false;
  icon  = null;

  icons = {
    "Negative": "https://hotemoji.com/images/dl/3/pouting-face-emoji-by-twitter.png",
    "Positive": "https://cdn.pixabay.com/photo/2020/12/27/20/24/smile-5865208_960_720.png",
    "Neutral": "https://www.emojiall.com/en/header-svg/%F0%9F%98%90%EF%B8%8E.png"
  }

  constructor(private http: HttpClient) { }


  ngOnInit() {

    this.$textArea.pipe(
      filter(value => Boolean(value)),
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((data) => {
      this.showSpinner = true;

    this.http.get(`http://localhost:8080/api/v1/eval?text=${data}`).subscribe((res: any) => {
      
        const item = res['Sentiment'];
        this.showSpinner = false;
        this.icon = this.icons[item];
     
    });
    });
  }
  
  sendData(event) {
    this.icon = null;
    this.$textArea.next(event.target.value);
  }

}
