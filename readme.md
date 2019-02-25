# Модуль DragAndDrop для проектов в iRidium mobile

Модуль позволяет организовать перетаскивание (drag and drop) элементов [iRidium mobile](http://www.iridi.com).

**Краткое описание работы**
Для элемента, который будет перетаскиваться создается второй **item**, в него копируются все свойства текущего состояния элемента. У текущего элемента устанавливается **Opacity=30** (возможно, установить другое значение). Задается массив целевых элементов, на которые перетаскивается исходный элемент. При отпускании на один из целевых элементов вызывается **callback**. 

## Тестовый собранный проект
Тестовый собранный проект находится в папке [build](https://github.com/bladerunner2020/drag-n-drop/blob/master/test/build/drag-test1.0.0-5.irpz). Тестовый проект собран при помощи утилиты [Iridium-Grunt](https://github.com/bladerunner2020/iridium-grunt), но модуль может использоваться, как вместе с **Iridium-Grunt**, так и без.

## Быстрый старт. Использование модуля без использования Iridium-Grunt.

- **Шаг 1.** Скачать и добавить в проект скрипт [drag-n-drop.js](https://github.com/bladerunner2020/drag-n-drop/blob/master/drag-n-drop.js)
- **Шаг 2.** Создать в вашем проекте элемент, который нужно перетаскивать и элемент(ы), на который нужно перетащить исходный элемент.
- **Шаг 3.** Создать новый скрипт или добавить следующий код в существующий скрипт:

```javascript
var sourceItem = IR.GetPage('Main').GetItem('SourceItem');
var target1 = IR.GetPage('Main').GetItem('TargetItem1');
var target2 = IR.GetPage('Main').GetItem('TargetItem2');
var target3 = IR.GetPage('Main').GetItem('TargetItem3');
new DragAndDrop(sourceItem, [target1, target2, target3], function(source, destination) {
    // Добавить код для обработки результата перетаскивания
});
```

После этого слайдер готов к работе.

## Описание функций

- **setOpacity(opacity)** - установить значения прозрачности для исходного элемента (по умолчанию значение равно 30), 0 - при перетаскивании исходный элемент не будет виден, 255 - исходный элемент будет виден без изменений, undefined - исходное значение прозрачности.
- **setIntersectionValue(value)** - устанавливает значение какой процент площади перетаскиваемого элемента должно перекрывать целевой элемент. По умолчанию 0.5 (50%).

## Авторы

* Александр Пивоваров aka Bladerunner2020 ([pivovarov@gmail.com](mailto:pivovarov@gmail.com))

## Лицензия
Copyright (c) 2018 Александр Пивоваров

Данная лицензия разрешает лицам, получившим копию данного программного обеспечения и сопутствующей документации (в дальнейшем именуемыми «Программное Обеспечение»), безвозмездно использовать Программное Обеспечение без ограничений, включая неограниченное право на использование, копирование, изменение, слияние, публикацию, распространение, сублицензирование и/или продажу копий Программного Обеспечения, а также лицам, которым предоставляется данное Программное Обеспечение, при соблюдении следующих условий:

Указанное выше уведомление об авторском праве и данные условия должны быть включены во все копии или значимые части данного Программного Обеспечения.

ДАННОЕ ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, ЯВНО ВЫРАЖЕННЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ, ВКЛЮЧАЯ ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ, СООТВЕТСТВИЯ ПО ЕГО КОНКРЕТНОМУ НАЗНАЧЕНИЮ И ОТСУТСТВИЯ НАРУШЕНИЙ, НО НЕ ОГРАНИЧИВАЯСЬ ИМИ. НИ В КАКОМ СЛУЧАЕ АВТОРЫ ИЛИ ПРАВООБЛАДАТЕЛИ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО КАКИМ-ЛИБО ИСКАМ, ЗА УЩЕРБ ИЛИ ПО ИНЫМ ТРЕБОВАНИЯМ, В ТОМ ЧИСЛЕ, ПРИ ДЕЙСТВИИ КОНТРАКТА, ДЕЛИКТЕ ИЛИ ИНОЙ СИТУАЦИИ, ВОЗНИКШИМ ИЗ-ЗА ИСПОЛЬЗОВАНИЯ ПРОГРАММНОГО ОБЕСПЕЧЕНИЯ ИЛИ ИНЫХ ДЕЙСТВИЙ С ПРОГРАММНЫМ ОБЕСПЕЧЕНИЕМ.
