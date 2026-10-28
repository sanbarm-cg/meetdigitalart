/* Standard form POST: FormSubmit processes and delivers the inquiry. */
(() => {
 const form=document.querySelector('#consultation-form');if(!form)return;
 form.addEventListener('submit',event=>{
  const status=document.querySelector('#consultation-status');
  if(form.dataset.mode!=='live'){
   event.preventDefault();status.textContent='Email connection is not active yet. / 메일 연결 준비 중입니다.';
   return;
  }
  status.textContent='Sending your request… / 상담 요청을 전송하고 있습니다…';
 });
})();
