/* global IR */

if (typeof _Debug === 'undefined') {
    // eslint-disable-next-line no-unused-vars
    var _Debug = function(msg, source) { IR.Log(msg); };
}

// eslint-disable-next-line no-unused-vars
function DragAndDrop(item, targetItems, cb) {
    this.x0 = item.X;
    this.y0 = item.Y;

    this.intersectValue = DragAndDrop.DEFAULT_INTERSECT_VALUE;

    var that = this;

    this.setOpacity = function(opacity) {
        var state = item.GetState(item.State);
        state.Opacity = (typeof opacity === 'undefined') ?  this.originalOpacity : opacity;
        return this;
    };

    this.setIntersectionValue = function(value) {
        this.intersectValue = value;
        return this;
    };

    this.onEndMove = function() {
        _Debug('onEndMove: ' + this.popup.Name, 'DragAndDrop');

        var rect1 = {x1: this.popup.X, x2: this.popup.X + this.popup.Width, y1: this.popup.Y, y2: this.popup.Y + this.popup.Height};

        for (var i = 0; i < targetItems.length; i++) {
            var targetItem = targetItems[i];
            var rect2 = {x1: targetItem.X, x2: targetItem.X + targetItem.Width, y1: targetItem.Y, y2: targetItem.Y + targetItem.Height};  
            
            var rect = getIntersectingRectangle(rect1, rect2);
            var value = rect ? getSquare(rect)/(this.popup.Width* this.popup.Height) : false;
            // _Debug('Intersect value (i = ' + i + '): ' + value, 'DragAndDrop');

            if (value >= this.intersectValue) {
                if (cb) { cb(item, targetItem); } 
                break;    
            }       
        }

        this.popup.X = this.x0;
        this.popup.Y = this.y0;
    };

    this.onItemShow = function() {
        function copyProps(dest, src, props) {
            for (var i = 0; i < props.length; i++) {
                dest[props[i]] = src[props[i]];
            }
        }

        var name = 'Popup_' + item.Name;
        that.popup = IR.CreateItem(IR.ITEM_POPUP, name, item.X, item.Y, item.Width, item.Height);
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

        _Debug('Created popup: ' + name, 'DragAndDrop');
    };

    this.onItemHide = function() {
        var name = that.popup.Name;
        _Debug('Removing popup: ' + name, 'DragAndDrop');

        that.setOpacity();

        IR.RemoveListener(IR.EVENT_MOUSE_UP, that.popup, that.onEndMove);
        IR.RemoveListener(IR.EVENT_TOUCH_UP, that.popup, that.onEndMove);

        IR.DeleteItem(that.popup);
        that.popup = null;
    };

    IR.AddListener(IR.EVENT_ITEM_SHOW, item, this.onItemShow, this);
    IR.AddListener(IR.EVENT_ITEM_HIDE, item, this.onItemHide, this);

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
}
DragAndDrop.DEFAULT_OPACITY = 30;
DragAndDrop.DEFAULT_INTERSECT_VALUE = 0.5;