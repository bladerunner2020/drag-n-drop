/* global IR */


// eslint-disable-next-line no-unused-vars
function DragAndDrop(item, targetItems, cb) {
    this.item = item;

    this.x0 = item.X;
    this.y0 = item.Y;

    this.onEndMove = function() {
        var rect1 = {x1: this.item.X, x2: this.item.X + this.item.Width, y1: this.item.Y, y2: this.item.Y + this.item.Height};

        for (var i = 0; i < targetItems.length; i++) {
            var targetItem = targetItems[i];
            var rect2 = {x1: targetItem.X, x2: targetItem.X + targetItem.Width, y1: targetItem.Y, y2: targetItem.Y + targetItem.Height};  
            
            IR.Log('rect2: ' + JSON.stringify(rect2));
  

            var rect = getIntersectingRectangle(rect1, rect2);
            var value = rect ? getSquare(rect)/(item.Width*item.Height) : false;
            IR.Log('Intersect value (i = ' + i + '): ' + value);

            if (value > 0.5) {
                if (cb) {
                    cb(item, targetItem);
                } 
                break;    
            }       
        }


        this.item.X = this.x0;
        this.item.Y = this.y0;
    };

    this.initialize = function() {
        var popup = IR.GetPopup(this.item.Name);

        if (popup) {
            IR.AddListener(IR.EVENT_MOUSE_UP, this.item, this.onEndMove, this);
            IR.AddListener(IR.EVENT_TOUCH_UP, this.item, this.onEndMove, this);
        }
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


    this.initialize();
}
