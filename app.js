// BUDGET Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    };

    return {
        addItem: function (type, desc, value) {
            var newItem, ID, len;
            len = data.allItems[type].length;
            if (len > 0) {
                ID = data.allItems[type][len - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, desc, value);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, value);
            }

            data.allItems[type].push(newItem);

            return newItem;

        },

        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calculatePercentage(data.totals.inc);
            })
        },
        getPercentages: function () {
            var allPercentages;
            allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }
    };

})();


//UI Controller
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        monthYearLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '- ' : '+ ') + int + '.' + dec;

    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                inputType: document.querySelector(DOMStrings.inputType).value,
                inputDesc: document.querySelector(DOMStrings.inputDesc).value,
                inputValue: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMStrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%">\n' +
                    '                            <div class="item__description">%desc%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseList;
                html = '<div class="item clearfix" id="exp-%id%">\n' +
                    '                            <div class="item__description">%desc%</div>\n' +
                    '                            <div class="right clearfix">\n' +
                    '                                <div class="item__value">%value%</div>\n' +
                    '                                <div class="item__percentage">21%</div>\n' +
                    '                                <div class="item__delete">\n' +
                    '                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '                                </div>\n' +
                    '                            </div>\n' +
                    '                        </div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var element = document.getElementById(selectorID)
            element.parentNode.removeChild(element);
        },

        clearInputFields: function () {
            var fields, fieldArray;
            fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
            fieldArray = Array.prototype.slice.call(fields);
            fieldArray.forEach(function (current, index, array) {
                current.value = '';
            });
            fieldArray[0].focus();
        },
        displayBudget: function (obj) {
            var type = (obj.budget > 0) ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentages: function (percentages) {
            var fields;
            fields = document.querySelectorAll(DOMStrings.expensePercLabel);


            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })

        },

        displayMonthYear: function () {
            var now, month, year, monthsArray;
            now = new Date();
            monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.monthYearLabel).textContent = monthsArray[month] + ' ' + year;
        },
        changedType: function () {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + DOMStrings.inputDesc + ',' + DOMStrings.inputValue
            );
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        getDOMStrings: function () {
            return DOMStrings;
        }
    }

})();


//GLOBAL Controller
var controller = (function (budgetController, UIController) {

    var setupEventListeners = function () {
        var DOM = UIController.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);


    };


    var updateBudget = function () {
        budgetController.calculateBudget();

        var budget = budgetController.getBudget();

        UIController.displayBudget(budget);


    };

    var updatePercentage = function () {

        budgetController.calculatePercentages();

        var percentages = budgetController.getPercentages();

        UIController.displayPercentages(percentages);

    };

    var ctrlAddItem = function () {
        var input, newItem;
        //1. Get input data
        input = UIController.getInput();

        if (input.inputDesc !== "" && !isNaN(input.inputValue) && input.inputValue > 0) {
            // 2. Add data to budget controller
            newItem = budgetController.addItem(input.inputType, input.inputDesc, input.inputValue);

            //3. Add new item to UI
            UIController.addListItem(newItem, input.inputType);

            //4.Clear input fields
            UIController.clearInputFields();
            //5. Call update Budget method
            updateBudget();

            updatePercentage();


        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitID = itemID.split('-');
        if (itemID) {
            type = splitID[0];
            id = parseInt(splitID[1]);
            budgetController.deleteItem(type, id);
            UIController.deleteListItem(itemID);
            updateBudget();
            updatePercentage();
        }
    };

    return {
        init: function () {
            console.log("Applications has started...");
            UIController.displayMonthYear();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();