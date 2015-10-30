window.bee = window.bee || {};
(function(bee) {

    var debug = false;

    function getContent(trigger, selector) {
        if (!(this instanceof getContent)) {
            return new getContent(trigger, selector);
        }
        if (selector != undefined) {
            this.planeText = $(trigger).find(selector).text();
        } else {
            this.planeText = $(trigger).text();
        }
        if (this.planeText == undefined && this.planeText == "" && $(trigger).find("input[type=submit]")) {
            this.planeText = $(trigger).find("input[type=submit]").attr("value");
        }
        if (this.planeText == undefined && this.planeText == "" && $(trigger).find("input[type=button]")) {
            this.planeText = $(trigger).find("input[type=submit]").attr("value");
        }
        if (this.planeText == undefined && this.planeText == "" && $(trigger).find("img")) {
            this.planeText = $(trigger).find("img").attr("alt");
        }
        return this;
    };

    getContent.prototype.getText = function() {
        return this.planeText;
    };

    getContent.prototype.replace = function(params) {
        if (!params) return this;
        if (params.to == undefined) params.to = "";
        if (params.regexp instanceof RegExp) {
            this.planeText = this.planeText.replace(params.regexp, params.to)
        } else {
            throw Error('Invalid RegExp: ' + params.regexp);
        }
        return this;
    };

    getContent.prototype.cut = function(params) {
        if (this.planeText != undefined && params) {
            var text = this.planeText;
            this.planeText = text.substring(params.start, params.end);
        }
        return this;
    };

    getContent.prototype.trim = function() {
        if (this.planeText != undefined) {
            var text = this.planeText;
            text = text.replace(/\r\n|\n|\r|\s/gm, " ");
            text = text.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, " ");
            text = text.replace(/\s+(?=\s)/g, " ");
            text = text.trim();
            this.planeText = text;
        }
        return this;
    };

    var getNth = function(element) {
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
        if (Object.prototype.toString.call(window.dataLayer) !== "[object Array]") {
            throw Error("Wrong instanceof of dataLayer ", window.dataLayer);
        }
        if (data) {
            data.event = data.event != undefined ? data.event : "GA_event";
            //data.eventLabel = data.eventLabel != undefined ? data.eventLabel : {
            //{
            //URL Host - Path
            //}
            //}
            window.dataLayer.push(data);
            if (debug) console.log("pushData ", data);
        }
    };

    function collectInfo(target, collection, trigger) {
        if (debug) console.log('Start collecting information for object: ', collection);

        var adapter, category,
            place = collection.selector.replace(/\.|\#|\>/gm, ""),
            controller = (collection.eventdata && collection.eventdata.category) ? collection.eventdata.category : false,
            content = new getContent(trigger, collection.content)
            .replace(collection.replace)
            .trim()
            .cut(collection.cut)
            .getText();
        if (controller && controller === "linkClick") {
            adapter = function() {
                var category = collection.eventdata.category,
                    action = (collection.eventdata && collection.eventdata.action) ? collection.eventdata.action : content + ' / ' + place,
                    context = $(trigger).attr("href");
                return {
                    "eventCategory": category,
                    "eventAction": action,
                    "eventContext": context
                }
            }
        } else if (controller && controller === "openReclame") {
            adapter = function() {
                var context = getNth(trigger),
                    category = collection.eventdata.category,
                    action = collection.eventdata.action + " / " + content;
                return {
                    "eventCategory": category,
                    "eventAction": action,
                    "eventContext": context
                };
            }
        } else if (controller && controller === "hiddenInteraction") {
            adapter = function() {
                var category = $(trigger).hasClass('opened') ? 'closeHidden' : 'openHidden',
                    action = collection.eventdata.action ? collection.eventdata.action : content + ' / ' + place;
                return {
                    "eventCategory": category,
                    "eventAction": action
                };
            }
        } else if (controller && controller === "checkInteraction") {
            adapter = function() {
                var category,
                    action = collection.eventdata.action ? collection.eventdata.action : content + ' / ' + place,
                    checkbox = $(trigger).find(".checkbox") || $(trigger).find(".checkbox-slide") || trigger;
                if (!checkbox.hasClass("inactive")) {
                    if (checkbox.hasClass("checkbox-slide")) {
                        category = checkbox.hasClass("checked") ? "checkOn" : "checkOff";
                    } else {
                        category = checkbox.hasClass("checked") ? "checkOff" : "checkOn";
                    }
                }
                return {
                    "eventCategory": category,
                    "eventAction": action
                };
            }
        } else {
            adapter = function() {
                var category = (collection.eventdata && collection.eventdata.category) ? collection.eventdata.category : "commonClick",
                    action = (collection.eventdata && collection.eventdata.action) ? collection.eventdata.action : content + ' / ' + place;
                return {
                    "eventCategory": category,
                    "eventAction": action
                }
            }
        }
        pushData(adapter);
    }

    function checkTargetComplies(data, target) {
        if (!data || !target) {
            throw Error('Invalid arguments: ' + data + ' ' + target);
        }
        for (var i = 0; i < data.length; i++) {
            for (
                var elem = target; elem && elem != this && elem.parentNode && elem.parentNode.tagName != "BODY"; elem = elem.parentNode
            ) {
                if (debug) console.log(i, data[i].selector, elem.matches(data[i].selector));
                if (typeof elem.matches == 'function' && elem.matches(data[i].selector)) {
                    if (debug) console.log("Complies have been found");
                    return {
                        collection: data[i],
                        trigger: elem
                    }
                }
            }
        }
        return false;
    };

    var ClickTracking = new function() {
        $(document).on("mousedown touchstart", function(e) {
            if (debug) console.log("event:", e);
            var triggerdata = checkTargetComplies(bee.data, e.target);
            triggerdata && collectInfo(e.target, triggerdata.collection, triggerdata.trigger);
        });
    };

    var AjaxTracking = new function() {

    };
    bee.getContent = getContent;
    bee.pushData = pushData;

}(window.bee));
