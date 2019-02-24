/* global IR */


// eslint-disable-next-line no-unused-vars
function DragAndDrop(item, targetItems, cb) {
    this.x0 = item.X;
    this.y0 = item.Y;

    var that = this;

    this.setOpacity = function(opacity) {
        var state = item.GetState(item.State);
        state.Opacity = (typeof opacity === 'undefined') ?  this.originalOpacity : opacity;
    };

    this.onEndMove = function() {
        var rect1 = {x1: this.popup.X, x2: this.popup.X + this.popup.Width, y1: this.popup.Y, y2: this.popup.Y + this.popup.Height};

        for (var i = 0; i < targetItems.length; i++) {
            var targetItem = targetItems[i];
            var rect2 = {x1: targetItem.X, x2: targetItem.X + targetItem.Width, y1: targetItem.Y, y2: targetItem.Y + targetItem.Height};  
            
            IR.Log('rect2: ' + JSON.stringify(rect2));
  

            var rect = getIntersectingRectangle(rect1, rect2);
            var value = rect ? getSquare(rect)/(this.popup.Width* this.popup.Height) : false;
            IR.Log('Intersect value (i = ' + i + '): ' + value);

            if (value > 0.5) {
                if (cb) {
                    cb(item, targetItem);
                } 
                break;    
            }       
        }

        this.popup.X = this.x0;
        this.popup.Y = this.y0;
    };

    IR.AddListener(IR.EVENT_ITEM_SHOW, item, function() {
        function copyProps(dest, src, props) {
            for (var i = 0; i < props.length; i++) {
                dest[props[i]] = src[props[i]];
            }
        }

        that.popup = IR.CreateItem(IR.ITEM_POPUP, 'Popup_' + item.Name, item.X, item.Y, item.Width, item.Height);
        that.popup.Drag = true;
        var state = item.GetState(item.State);
        var popupState = that.popup.GetState(0);

        copyProps(popupState, state, [
            'Color', 'FillColor', 'Text', 'Border', 'BorderColor', 'TextColor', 'TextEffectColor', 'Opacity', 
            'Image', 'ImageX', 'ImageY', 'ImageAlign', 'ImageStretch', 'Icon', 'IconX', 'IconY', 'IconAlign', 'FontId',
            'TextAlign', 'TextX', 'TextY', 'TextEffect', 'DrawOrder', 'WordWrap'
        ]);

        that.originalOpacity = state.Opacity;
        state.Opacity = DragAndDrop.DEFAULT_OPACITY;

        IR.ShowPopup(that.popup.Name);

        IR.AddListener(IR.EVENT_MOUSE_UP, that.popup, that.onEndMove, that);
        IR.AddListener(IR.EVENT_TOUCH_UP, that.popup, that.onEndMove, that);
    });

    IR.AddListener(IR.EVENT_ITEM_HIDE, item, function() {
        IR.RemoveListener(IR.EVENT_MOUSE_UP, that.popup, that.onEndMove);
        IR.RemoveListener(IR.EVENT_TOUCH_UP, that.popup, that.onEndMove);

        IR.RemoveItem(that.popup);
        that.popup = null;
    });

    this.initialize = function() {
        function copyProps(dest, src, props) {
            for (var i = 0; i < props.length; i++) {
                dest[props[i]] = src[props[i]];
            }
        }

        this.popup = IR.CreateItem(IR.ITEM_POPUP, 'Popup_' + item.Name, item.X, item.Y, item.Width, item.Height);
        this.popup.Drag = true;
        var state = item.GetState(item.State);
        var popupState = this.popup.GetState(0);

        copyProps(popupState, state, [
            'Color', 'FillColor', 'Text', 'Border', 'BorderColor', 'TextColor', 'TextEffectColor', 'Opacity', 
            'Image', 'ImageX', 'ImageY', 'ImageAlign', 'ImageStretch', 'Icon', 'IconX', 'IconY', 'IconAlign', 'FontId',
            'TextAlign', 'TextX', 'TextY', 'TextEffect', 'DrawOrder', 'WordWrap'
        ]);

        this.originalOpacity = state.Opacity;
        state.Opacity = DragAndDrop.DEFAULT_OPACITY;

        IR.ShowPopup(this.popup.Name);

        IR.AddListener(IR.EVENT_MOUSE_UP, this.popup, this.onEndMove, this);
        IR.AddListener(IR.EVENT_TOUCH_UP, this.popup, this.onEndMove, this);
    };

    function getIntersectingRectangle(r1, r2) {  
        var noIntersect = r2.x1 > r1.x2 || r2.x2 < r1.x1 || r2.y1 > r1.y2 || r2.y2 < r1.y2;
      
        return noIntersect ? false : {
            x1: Math.max(r1.x1, r2.x1),
            y1: Math.max(r1.y1, r2.y1), 
            x2: Math.min(r1.x2, r2.x2),
            y2: Math.min(r1.y2, r2.y2)
        };
    }

    function getSquare(rect) {
        return Math.abs((rect.x1 - rect.x2) * (rect.y1 - rect.y2));
    }


    // this.initialize();
}
DragAndDrop.DEFAULT_OPACITY = 30;
