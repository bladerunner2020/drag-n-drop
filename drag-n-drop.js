// drag-n-drop.js
/* global IR */

/**
 * 
 * @param {Object} source - iridium item returned by GetItem(...)
 * @param {*} dest - iridium item or array of items or array of array of items
 * @param {function} cb - callback
 */
function DragAndDrop(source, dest, cb) { 
    this.intersectValue = DragAndDrop.DEFAULT_INTERSECT_VALUE;
    this.focusedTarget = undefined;
    this.savedProps =  {};
    this.focusedItemProps = undefined;

    var targetItems = Array.isArray(dest) ? dest : [dest];
    var item =  source;

    var that = this;

    this.setOpacity = function(opacity) {
        var state = item.GetState(item.State);
        state.Opacity = (typeof opacity === 'undefined') ?  this.originalOpacity : opacity;
        return this;
    };

    this.setTargets = function(dest) {
        targetItems = Array.isArray(dest) ? dest : [dest];
        return this;
    };

    this.setFocusedItemProps = function(props) {
        this.focusedItemProps = props;
        return this;
    };

    this.setIntersectionValue = function(value) {
        this.intersectValue = value;
        return this;
    };

    this.onEndMove = function() {
        // _Debug('onEndMove: ' + this.dragItem.Name, 'DragAndDrop');

        var target = this.getBestFitTarget();
        if (target && cb) {
            cb(item, target);
        }

        this.setFocusedItem(undefined);
        
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
        this.dragItem = item.Parent.CreateItem(item.Type, name, item.X, item.Y, item.Width, item.Height);
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

        var target = this.getBestFitTarget();
        this.setFocusedItem(target);


        if (this.dragItem) {
            this.dragItem.X = x;
            this.dragItem.Y = y;
        }
    };

    this.setFocusedItem = function(target) {
        if (this.focusedTarget && this.focusedTarget !== target) {
            this.restoreProps();
            this.focusedTarget = undefined;
        }

        if (target !== this.focusedTarget) {
            this.focusedTarget = target;
            this.saveProps(target, this.focusedItemProps);
            this.setNewProps(target, this.focusedItemProps);
        }
    };

    this.setNewProps = function(target, props) {
        if (Array.isArray(target)) {
            var that = this;
            target.forEach(function(t) {
                that.setNewProps(t, props);
            });
            return;
        }

        for (var i = 0; i < target.StatesCount; i++) {
            var state = target.GetState(i);
            for (var p in props) {
                state[p] =  props[p];
            }
        }
    };

    this.saveProps = function(target, props) {
        if (!this.savedFocusTargets) {
            this.savedFocusTargets = {};
        }

        if (Array.isArray(target)) {
            var that = this;
            target.forEach(function(t) {
                that.saveProps(t, props);
            });
            return;
        }

        var savedStates = [];

        for (var i = 0; i < target.StatesCount; i++) {
            savedStates[i] = {};
            var state = target.GetState(i);
            for (var p in props) {
                savedStates[i][p] = state[p];
            } 
        }

        this.savedFocusTargets[target.Name] = {
            item: target, 
            states: savedStates
        };
    };

    this.restoreProps = function() {
        for (var name in this.savedFocusTargets) {
            var target = this.savedFocusTargets[name];
            for (var i = 0; i < target.states.length; i++) {
                var state = target.item.GetState(i);
                for (var p in target.states[i]) {
                    state[p] = target.states[i][p];
                }
            }
        }
        this.savedFocusTargets = {};
    };

    this.onDragItemPress = function() {
        this.onEndMove();
    };

    IR.AddListener(IR.EVENT_MOUSE_DOWN, item, this.onStartDrag, this);
    IR.AddListener(IR.EVENT_TOUCH_DOWN, item, this.onStartDrag, this);


    this.getBestFitTarget = function(onlyOne) {
        var rect1 = {x1: this.dragItem.X, x2: this.dragItem.X + this.dragItem.Width, y1: this.dragItem.Y, y2: this.dragItem.Y + this.dragItem.Height};

        var maxIndex = -1;
        var maxIndex2 = -1;
        var maxValue = 0;

        for (var i = 0; i < targetItems.length; i++) {
            if (targetItems[i]) {
                var count = Array.isArray(targetItems[i]) ? targetItems[i].length : 1;
                for (var j = 0; j < count; j++) {
                    var targetItem = Array.isArray(targetItems[i]) ? targetItems[i][j] : targetItems[i];

                    var rect2 = {x1: targetItem.X, x2: targetItem.X + targetItem.Width, y1: targetItem.Y, y2: targetItem.Y + targetItem.Height};  
                
                    var rect = getIntersectingRectangle(rect1, rect2);
                    var value = rect ? getSquare(rect)/(this.dragItem.Width* this.dragItem.Height) : false;
    
                    if (value > maxValue) {
                        maxIndex2 = j;
                        maxIndex = i;
                        maxValue = value;
                    }   
                } 
            }
        }

        if (maxValue > 0) {
            if (onlyOne && Array.isArray(targetItems[maxIndex])) {
                return targetItems[maxIndex][maxIndex2];
            } else {
                return targetItems[maxIndex];
            }
        } 
    };


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
