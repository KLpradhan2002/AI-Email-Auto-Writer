console.log("email")

const getEmailContent=()=>{
    const selectors=['.h7','.a3s.aiL','.gmail_quote','[role="presentation"]'];
    for(const selector of selectors){
    const content=document.querySelector(selector);
    if(content)
        return content.innerText;
    }return '';
}
const findComposeToolbar=()=>{
const selectors=['.btC','.aDh','[role="toolbar"]','.gU.Up'];
for(const selector of selectors){
    const toolbar=document.querySelector(selector);
    if(toolbar)
        return toolbar;
}return null;
}

const creatAiBtn=()=>{
    const btn=document.createElement('div');
    btn.className='T-I J-J5-Ji aoO v7 T-I-atl L3';
    btn.style.marginRight='8px';
    btn.innerHTML='AI Reply';
    btn.setAttribute('role','button');
    btn.setAttribute('data-tooltip','Generate AI Reply');
    return btn;
}

const injectBtn=()=>{
    const existingBtn=document.querySelector('.ai-reply-btn')
    if(existingBtn){
        existingBtn.remove();
    }
    const toolbar=findComposeToolbar();
    if(!toolbar){
        console.log("toolbar not found");  
        return;
    }
    const button=creatAiBtn();
    button.classList.add('.ai-reply-btn');

    button.addEventListener('click',async()=>{
        try {
            button.innerHTML='Generating...'
            button.disabled=true;
            const emailContent=getEmailContent();

            const response= await fetch('http://localhost:8080/api/email/generate',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    emailContent:emailContent,
                    tone:"professional"
                })
            });

            if(!response.ok){
                throw new Error("API Request failed")
            }

            const generateReply=await response.text();

            const composeBox=document.querySelector(
                '[role="textbox"][g_editable="true"]'
            );
            if(composeBox){
                composeBox.focus();
                document.execCommand('insertText',false,generateReply);
            }
        } catch (error) {
            console.error("Error:", error);
        }
        finally{
            button.innerHTML = 'AI Reply';
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        }
    })

    toolbar.insertBefore(button,toolbar.firstChild)
}
const observer=new MutationObserver((mutations)=>{
    for(const mutation of mutations){
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements= addedNodes.some(node=> node.nodeType=== Node.ELEMENT_NODE && (node.matches('.aDh, .btC, [role="dialog"]')
        || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if(hasComposeElements){
            setTimeout(injectBtn,500);
        }
    }
});

observer.observe(document.body,{
    childList:true,
    subtree:true
})
