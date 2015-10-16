(function() {
    var TagText = function(target) {
        this.target = $(target);
        this.planeText = this.target.text();
        return this;
    };

    TagText.prototype.getText = function() {
        return this.planeText;
    };

    TagText.prototype.valuable = function(selector) {
        if (selector) {
            this.planeText = this.target.find(selector).text();
        }
        return this;
    };

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

    TagText.prototype.cut = function(opt) {
        if (opt && opt.length !== undefined) {
            var text = this.planeText;
            this.planeText = text.substring.apply(text, opt);
        }
        return this;
    };

    TagText.prototype.trim = function() {
        var text = this.planeText;
        text = text.trim();
        text = text.replace(/\r\n|\n|\r|\s/gm, " ");
        text = text.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, " ");
        text = text.replace(/\s+(?=\s)/g, " ");
        this.planeText = text;
        return this;
    };


    function getTargetCollection(data, target) {
        if (!data || !target) {
            throw Error('Invalid arguments: ' + data +' ' + target)
        }
        var i;
        for (i = data.length - 1; i >= 0; --i) {
            if ($(target).get(0) === $(data[i].trigger).get(0)) {
                return data[i];
            }
        }
        return false;
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



    function pushData(cb) {
        var data = cb();
        if (data) {
            data.event = 'GA_event';
            data.eventLabel = 'URL Host - Path'
            var dataLayer = window.dataLayer || [];
            dataLayer.push(data);
            console.info(data)
        } else {
            throw Error('Controller action undefined');
        }
    };
    /*
     *
     */
    function store(target, col6n) {
        console.log('col6n', !!col6n);
        var ctrlAction = col6n.ctrl.action;
        var text = new TagText(target)
            .valuable(col6n.valuable)
            .trim()
            .cut(col6n.cut)
            .replace(col6n.replace)
            .getText();

        var place = col6n.trigger.replace(/\.|\#|\>/gm, "");
        if (ctrlAction === 'Click') {
            var adapter = function() { //Simple Click
                return {
                    "eventCategory": ctrlAction,
                    "eventAction": text + ' / ' + place
                }
            }
        }
        if (ctrlAction === 'OpenReclame') {
            adapter = function() { // Open Reclame
                var action = col6n.ctrl.category ? col6n.ctrl.category : col6n.text + ' / ' + place;
                var context = getNth(col6n.target) + ' / ' + text;
                return {
                    "eventCategory": col6n.ctrl.category,
                    "eventAction": action,
                    'eventContext': context
                };
            }
        }
        if (ctrlAction === 'hiddenInteraction') {
            adapter = function() { // Hidden Interaction
                var action = col6n.ctrl.category ? col6n.ctrl.category : text + ' / ' + place;
                var category = col6n.target.hasClass('opened') ? 'openHidden' : 'closeHidden';

                return {
                    "eventCategory": category,
                    "eventAction": action
                };
            }

        };
        pushData(adapter);
    }

    bee.ClickTracking = new function() {
        $(document).click(function(e) {
            var collection = getTargetCollection(bee.data, e.target);
            collection && store(e.target, collection);
        });
    };

    bee.AjaxTracking = new function() {
    };

}())
