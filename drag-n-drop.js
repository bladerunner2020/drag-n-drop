// drag-n-drop.js
/* global IR */

// eslint-disable-next-line no-unused-vars
function DragAndDrop(item, targetItems, cb) {
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
        // _Debug('onEndMove: ' + this.dragItem.Name, 'DragAndDrop');

        var rect1 = {x1: this.dragItem.X, x2: this.dragItem.X + this.dragItem.Width, y1: this.dragItem.Y, y2: this.dragItem.Y + this.dragItem.Height};

        for (var i = 0; i < targetItems.length; i++) {
            var targetItem = targetItems[i];
            var rect2 = {x1: targetItem.X, x2: targetItem.X + targetItem.Width, y1: targetItem.Y, y2: targetItem.Y + targetItem.Height};  
            

            // _Debug(JSON.Stringify(rect1));
            // _Debug(JSON.Stringify(rect2));
            var rect = getIntersectingRectangle(rect1, rect2);
            var value = rect ? getSquare(rect)/(this.dragItem.Width* this.dragItem.Height) : false;
            // _Debug('Intersect value (i = ' + i + '): ' + value, 'DragAndDrop');

            if (value >= this.intersectValue) {
                if (cb) { cb(item, targetItem); } 
                break;    
            }       
        }

        this.dragItem.X = item.X;
        this.dragItem.Y = item.Y;

        that.setOpacity(); // reset initial value of opacity

        IR.RemoveListener(IR.EVENT_MOUSE_UP, item, this.onEndMove);
        IR.RemoveListener(IR.EVENT_TOUCH_UP, item, this.onEndMove);
        IR.RemoveListener(IR.EVENT_MOUSE_MOVE, item, this.onDragItem);
        IR.RemoveListener(IR.EVENT_TOUCH_MOVE, item, this.onDragItem);  
        IR.RemoveListener(IR.EVENT_ITEM_PRESS, this.dragItem, this.onDragItemPress);      

        IR.DeleteItem(that.dragItem);
        that.dragItem = null;
    };

    this.onStartDrag = function(x, y) {
        // _Debug('Start dragging: ' + item.Name, 'DragAndDrop');

        this.dragOffsetX = item.X - x;
        this.dragOffsetY = item.Y - y;

        function copyProps(dest, src, props) {
            for (var i = 0; i < props.length; i++) {
                dest[props[i]] = src[props[i]];
            }
        }

        if (this.dragItem) {
            this.onEndMove();
        }

        var name = 'Drag_' + item.Name;
        this.dragItem = IR.CreateItem(item.Type, name, item.X, item.Y, item.Width, item.Height);
        var state = item.GetState(item.State);
        var dragItemState = that.dragItem.GetState(0);

        copyProps(dragItemState, state, [
            'Color', 'FillColor', 'Text', 'Border', 'BorderColor', 'TextColor', 'TextEffectColor', 'Opacity', 
            'Image', 'ImageX', 'ImageY', 'ImageAlign', 'ImageStretch', 'Icon', 'IconX', 'IconY', 'IconAlign', 'FontId',
            'TextAlign', 'TextX', 'TextY', 'TextEffect', 'DrawOrder', 'WordWrap'
        ]);

        that.originalOpacity = state.Opacity;
        state.Opacity = DragAndDrop.DEFAULT_OPACITY;

        IR.AddListener(IR.EVENT_MOUSE_UP, item, this.onEndMove, this);
        IR.AddListener(IR.EVENT_TOUCH_UP, item, this.onEndMove, this);
        IR.AddListener(IR.EVENT_MOUSE_MOVE, item, this.onDragItem, this);
        IR.AddListener(IR.EVENT_TOUCH_MOVE, item, this.onDragItem, this);
        IR.AddListener(IR.EVENT_ITEM_PRESS, this.dragItem, this.onDragItemPress, this);
    };

    this.onDragItem = function(x, y) {

        x += this.dragOffsetX;
        y += this.dragOffsetY;

        // _Debug('MoveItem. X: ' + x + ', Y: ' + y, 'DragAndDrop');

        if (x <= 0 || y <= 0 || x >= (item.Parent.Width - item.Width) || y >= (item.Parent.Height - item.Height)) {
            // reaches boundaries of page
            this.onEndMove();
            return;
        }

        if (this.dragItem) {
            this.dragItem.X = x;
            this.dragItem.Y = y;
        }
    };

    this.onDragItemPress = function() {
        this.onEndMove();
    };

    IR.AddListener(IR.EVENT_MOUSE_DOWN, item, this.onStartDrag, this);
    IR.AddListener(IR.EVENT_TOUCH_DOWN, item, this.onStartDrag, this);


    function getIntersectingRectangle(r1, r2) {  
        var noIntersect = r2.x1 > r1.x2 || r2.x2 < r1.x1 || r2.y1 > r1.y2 || r2.y2 < r1.y1;
      
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