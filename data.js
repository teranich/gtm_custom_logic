var bee = bee || {};
bee.data = [{
    trigger: '.dynamic.show-all em',
    //valuable: 'em', //required
    //payload: 'span',
    ctrl: {
        action: 'Click',
        category: 'cantegoryName',
        context: 'ContextName'
    },
    cut: [0, 11],
    replace: {
        regexp: /hon/i,
        to: 'blablabla'
    },
},{
    trigger: '#Services1 h4:eq(0) .dynamic',
    //valuable: '#catalogHeader', //required
    ctrl: {
        action: 'Click',
        category: 'cantegoryName',
        context: 'ContextName'
    },
    //payload: 'span',
    cut: [0, 11],
}];

//console.log('win bee2', window.bee2);
