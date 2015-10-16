# gtm_custom_logic
The declarative structure use other events and custom dataLayer payloads. Google Tag Manager


  
    trigger: '.dynamic.show-all em', //required селектор на котором срабатывает событие
    valuable: 'em',                  //селектор из которого берется текст для GTM переменной
    cut: [0, 11],                    //[from, to] выбрать подстроку из текста от позиции from до to
    replace: {                       //заменить подстроку в тексте, оответстующую регулярному выражению
        regexp: /hon/i,
        to: 'blablabla'
    },
    
    ctrl: {                          //Контроллер для сбора дополнительных переменных GTM
        action: 'Click',             //required ID контроллера которому соответствует функция обработки
        category: 'cantegoryName',   //дополнитеьные поля
        context: 'ContextName'       // -- // --
    }

