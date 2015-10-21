(function() {
    var DEBUG = true;

    function log() {
        if (DEBUG) {
            console.info.apply(console, arguments)
        }
    }

    /* TagText 
     * Подготавливает текст target тэга.
     * вырезая, заменяя, удаляя лишниe пробелы
     *
     * target: object
     */
    var TagText = function(target) {
        this.target = $(target);
        this.planeText = this.target.text();
        return this;
    };

    /* getText
     *
     * Возвращает получившийся текст
     */
    TagText.prototype.getText = function() {
        return this.planeText;
    };

    /* content
     *
     * Задает возможность использовать текст из дочерних элементов
     * selector: string
     */
    TagText.prototype.content = function(selector) {
        if (selector) {
            this.planeText = this.target.find(selector).text();
        }
        return this;
    };

    /* replace
     *
     * заменяет текст, соответствующий регулярному выражению
     * opt: object({regexp: RegExp, to: string})
     */
    TagText.prototype.replace = function(opt) {
        if (!opt) {
            return this;
        }
        if (opt.regexp instanceof RegExp) {
            this.planeText = this.planeText.replace(opt.regexp, opt.to)
        } else {
            throw Error('Invalid RegExp: ' + opt.regexp);
        }
        return this;
    };

    /* cut
     *
     * вырезает текст, начиная с позиции opt.start, до opt.end
     * opt: object(start: int, end: int)
     */
    TagText.prototype.cut = function(opt) {
        if (opt && opt.length !== undefined) {
            var text = this.planeText;
            this.planeText = text.substring.apply(text, opt);
        }
        return this;
    };

    /* trim
     *
     * Удаляет лишнии пробелы, каретки и т.д.
     */
    TagText.prototype.trim = function() {
        var text = this.planeText;
        text = text.trim();
        text = text.replace(/\r\n|\n|\r|\s/gm, " ");
        text = text.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, " ");
        text = text.replace(/\s+(?=\s)/g, " ");
        this.planeText = text;
        return this;
    };

    function getNth(element) {
        var sibbling = element;
        var n = 1,
            i = 1;
        while ((sibbling = sibbling.previousSibling) && i++) {
            if (sibbling.nodeType === Node.ELEMENT_NODE) n++
        }
        var nth = n;
        return nth;
    }


    /* pushData
     *
     * записывает в dataLayer информацию,
     * сформированную в резуальтате вызова соответствующего
     * контроллера (cb) и системную (data.event)
     */
    function pushData(cb) {
        var data = cb();
        log('pushData', data)
        if (Object.prototype.toString.call(window.dataLayer) !== '[object Array]') {
            throw Error('Wrong instanceof of dataLayer ', window.dataLayer);
        }
        if (data) {
            data.event = 'GA_event';
            data.eventLabel = 'URL Host - Path'
            window.dataLayer.push(data);
            log(data);
        } else {
            throw Error('Controller action undefined');
        }
    };

    /* collectInfo
     *
     * подготавливает информацию к записи в dataLayer
     */
    function collectInfo(target, col6n) {
        log('col6n', col6n);

        var dataCategory = col6n.data.category;
        var text = new TagText(target)
            .content(col6n.content)
            .trim()
            .cut(col6n.cut)
            .replace(col6n.replace)
            .getText();

        var adapter;
        var place = col6n.trigger.replace(/\.|\#|\>/gm, "");

        /* адаптеры для storeData
         * адаптер соответствует контроллеру в коллекции по полю data.category
         */
        if (dataCategory === 'commonClick') {
            adapter = function() { //Simple Click
                return {
                    "eventCategory": dataCategory,
                    "eventAction": 'action',
                    adapter: text + ' / ' + place
                }
            }
        }
        if (dataCategory === 'OpenReclame') {
            adapter = function() { // Open Reclame
                var action = col6n.data.category ? col6n.data.category : col6n.text + ' / ' + place;
                var context = getNth(col6n.target) + ' / ' + text;
                return {
                    "eventCategory": col6n.data.category,
                    "eventAction": action,
                    'eventContext': context
                };
            }
        }
        if (dataCategory === 'hiddenInteraction') {
            adapter = function() { // Hidden Interaction
                var action = col6n.data.category ? col6n.data.category : text + ' / ' + place;
                var category = col6n.target.hasClass('opened') ? 'openHidden' : 'closeHidden';

                return {
                    "eventCategory": category,
                    "eventAction": action
                };
            }

        };
        pushData(adapter);
    }

    /* getTargetCollection
     *
     * Ищет соответствующий элемент в Коллекции
     * data: array(objects()) // коллекция, например bee.data
     * target: object or string // искомый элемент
     */
    function getTargetCollection(data, target) {
        if (!data || !target) {
            throw Error('Invalid arguments: ' + data + ' ' + target)
        }
        var i;
        for (i = data.length - 1; i >= 0; --i) {
            if ($(target).get(0) === $(data[i].trigger).get(0)) {
                return data[i];
            }
        }
        return false;
    };


    /*
     * обрабатываемые события
     */
    bee.ClickTracking = new function() {
        $(document).click(function(e) {
            log('click on', e)
            var collection = getTargetCollection(bee.data, e.target);
            collection && collectInfo(e.target, collection);
        });
    };

    bee.AjaxTracking = new function() {

    };

}());
