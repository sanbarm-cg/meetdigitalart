/* Submit on the page; show success only after Web3Forms accepts the request. */
(() => {
 const form=document.querySelector('#consultation-form');if(!form)return;
 const status=document.querySelector('#consultation-status');
 const button=form.querySelector('button[type="submit"]');
 let pending=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(pending)return;
  if(form.dataset.mode!=='live'){
   status.textContent='Email connection is not active yet. / 메일 연결 준비 중입니다.';return;
  }
  if(!form.reportValidity())return;
  if(form.querySelector('[name="botcheck"]').checked)return;
  pending=true;button.disabled=true;form.setAttribute('aria-busy','true');
  const originalLabel=button.textContent;
  button.textContent='Sending… / 전송 중…';
  status.textContent='Sending your request… / 상담 요청을 전송하고 있습니다…';
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),20000);
  try{
   const data=Object.fromEntries(new FormData(form));
   // The redirect is only for the no-JavaScript fallback.
   delete data.redirect;delete data.botcheck;
   const response=await fetch(form.action,{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(data),signal:controller.signal
   });
   const result=await response.json();
   if(!response.ok||result.success!==true){
    status.textContent='Your request was not accepted. Please try again later or email thinkbitsny@gmail.com. / 요청이 접수되지 않았습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.';
    return;
   }
   form.reset();
   status.textContent='Thank you! Your request has been submitted. We will reply by email. / 상담 요청이 접수되었습니다. 이메일로 답변드리겠습니다.';
  }catch(error){
   status.textContent='We could not confirm submission. Your message is still here. To avoid duplicates, please check before resending, or email thinkbitsny@gmail.com. / 접수 여부를 확인하지 못했습니다. 입력 내용은 보존되었습니다. 중복 전송 전 확인하거나 이메일로 문의해 주세요.';
  }finally{
   clearTimeout(timer);pending=false;button.disabled=false;
   button.textContent=originalLabel;form.removeAttribute('aria-busy');
  }
 });
})();
