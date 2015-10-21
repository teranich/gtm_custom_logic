var bee = bee || {};
bee.data = bee.data || [];
bee.data.push({
  trigger: ".form-inline .submit .CalculateButton span.disabled", // Required. Элемент, на который устанавливается событие
  content: null, // Если null, то берется значения из активного trigger, нужно также передавать скрипты
  data: {
    eventname: null,// Если null, берется дефолтное значение
    category: "commonClick", // Required. Категория события, также является именем контроллера
    action: null, // Если null, определяетя алгоритмом контроллера
    label: null, // Если null, берется дефолтное значение
    context: null // Если null, определяетя алгоритмом контроллера
  },
  cut: {
    text: { // Переменная, для которой необходимо обрезание текста
      start: null, // Если null, то 0
      end: 11 // Если null, то до конца строки
    },
    action: {
      end: 16  
      }
    },
  replace: {
    regexp: /hon/i,
    to: 'blablabla'
  },
});
