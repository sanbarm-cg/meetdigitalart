/* Standard form POST: FormSubmit verifies the request and delivers the inquiry. */
(() => {
 const form=document.querySelector('#consultation-form');if(!form)return;
 form.addEventListener('submit',event=>{
  const status=document.querySelector('#consultation-status');
  if(form.dataset.mode!=='live'){
   event.preventDefault();status.textContent='Email connection is not active yet. / 메일 연결 준비 중입니다.';
   return;
  }
  status.textContent='Opening secure verification… / 전송 확인 화면으로 이동합니다…';
 });
})();
