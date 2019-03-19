/*global IR, DragAndDrop */

var input1 = IR.GetPage('Main').GetItem('Input1');
var input2 = IR.GetPage('Main').GetItem('Input2');
var input3 = IR.GetPage('Main').GetItem('Input3');
var input4 = IR.GetPage('Main').GetItem('Input4');

var output1 = IR.GetPage('Main').GetItem('Output1');
var output2 = IR.GetPage('Main').GetItem('Output2');
var output3 = IR.GetPage('Main').GetItem('Output3');

function setOutput(input, output) {   
    if (Array.isArray(output)) {
        for (var i = 0; i < output.length; i++) {
            setOutput(input, output[i]);
        }
        return;
    }

    if (output.State) {
        output.Text = output.Name;
    }

    output.Text = output.Text + ':\n' + input.Name;
    output.State = 1;
}

new DragAndDrop(input1, [output1, output2, output3], setOutput);
new DragAndDrop(input2, [output1, output2, output3], setOutput)
    .setFocusedItemProps({Border: 10, BorderColor: 0xFF0000FF});
new DragAndDrop(input3, [[output1, output2, output3]], setOutput)
    .setFocusedItemProps({Border: 10, BorderColor: 0xFF0000FF});   
new DragAndDrop(input4, [output1, output2, output3], setOutput)
    .setFocusedItemProps({IncState: 2});    


IR.AddListener(IR.EVENT_ITEM_PRESS, output1, clearInput, {name: 'Output1'});
IR.AddListener(IR.EVENT_ITEM_PRESS, output2, clearInput, {name: 'Output2'});
IR.AddListener(IR.EVENT_ITEM_PRESS, output3, clearInput, {name: 'Output3'});


/**
 * @this
 */
function clearInput() {
    var output = IR.GetItem('Main').GetItem(this.name);
    output.State = 0;
    output.Text = this.name;
}

