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
        
        if (target && cb) {
            cb(item, target);
        }
    };

    this.onStartDrag = function(x, y) {
        // _Debug('Start dragging: ' + item.Name, 'DragAndDrop');

        this.dragOffsetX = item.X - x;
        this.dragOffsetY = item.Y - y;

        if (this.dragItem) {
            this.onEndMove();
        }

        var name = 'Drag_' + item.Name;
        this.dragItem = item.Clone(name);
        var state = item.GetState(item.State);
  
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

        if (!DragAndDrop.disabledHighlight) {
            var target = this.getBestFitTarget();
            this.setFocusedItem(target);
        }

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
        if (!props || !target) { return; }

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
                if (p === 'State') {
                    if (i === 0) {
                        // Только 1 раз вызываем
                        target.State = props.State;
                    }
                } else if (p === 'IncState') {
                    if (i === 0) {
                        // Только 1 раз вызываем
                        target.State += props.IncState;  
                    } 
                } else  {
                    state[p] =  props[p];
                }
            }
        }
    };

    this.saveProps = function(target, props) {
        if (!props || !target) { return; }

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

        var savedProps = {};
        var savedStates = [];

        for (var i = 0; i < target.StatesCount; i++) {
            savedStates[i] = {};
            var state = target.GetState(i);
            for (var p in props) {
                if (p === 'State' || p === 'IncState') {
                    if (i === 0) {
                        // только 1 раз
                        savedProps.State = target.State;
                    }
                } else {
                    savedStates[i][p] = state[p];
                }
            } 
        }

        this.savedFocusTargets[target.Name] = {
            item: target, 
            states: savedStates,
            props: savedProps
        };
    };

    this.restoreProps = function() {
        if (!this.savedFocusTargets) { return; }

        for (var name in this.savedFocusTargets) {
            var target = this.savedFocusTargets[name];
            for (var i = 0; i < target.states.length; i++) {
                var state = target.item.GetState(i);

                if (target.props && typeof target.props.State !== 'undefined') {
                    target.item.State = target.props.State;
                }

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


    this.getBestFitTarget = function() {
        var rect1 = {x1: this.dragItem.X, x2: this.dragItem.X + this.dragItem.Width, y1: this.dragItem.Y, y2: this.dragItem.Y + this.dragItem.Height};

        var maxIndex = -1;
        var maxValue = 0;

        for (var i = 0; i < targetItems.length; i++) {
            if (targetItems[i]) {
                var isArr =  targetItem = Array.isArray(targetItems[i]);
                var count = isArr ? targetItems[i].length : 1;
                for (var j = 0; j < count; j++) {
                    var targetItem = isArr ? targetItems[i][j] : targetItems[i];

                    if (!targetItem) { continue; }

                    var rect2 = {x1: targetItem.X, x2: targetItem.X + targetItem.Width, y1: targetItem.Y, y2: targetItem.Y + targetItem.Height};  
                
                    var value = getIntersectingSquare(rect1, rect2);
    
                    if (value > maxValue) {
                        maxIndex = i;
                        maxValue = value;
                    }   
                } 
            }
        }

        if (maxValue >= 0) {
            return targetItems[maxIndex];
        } 
    };

    function getIntersectingSquare(r1, r2) {  
        var noIntersect = r2.x1 > r1.x2 || r2.x2 < r1.x1 || r2.y1 > r1.y2 || r2.y2 < r1.y1;
      
        return noIntersect ? 0 : 
            Math.abs((Math.max(r1.x1, r2.x1) - Math.min(r1.x2, r2.x2)) * (Math.max(r1.y1, r2.y1) - Math.min(r1.y2, r2.y2)));
    }
}

DragAndDrop.DEFAULT_OPACITY = 30;
DragAndDrop.DEFAULT_INTERSECT_VALUE = 0.5;
