import { Directive, ViewContainerRef, ElementRef, HostListener, forwardRef, ChangeDetectorRef, Input, KeyValueDiffers, Output, EventEmitter, Renderer2, HostBinding } from '@angular/core';
import { DaterangepickerComponent } from './daterangepicker.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import dayjs from 'dayjs/esm';
import { LocaleService } from './locale.service';
import * as i0 from "@angular/core";
import * as i1 from "./locale.service";
export class DaterangepickerDirective {
    constructor(viewContainerRef, ref, el, renderer, differs, localeHolderService, elementRef) {
        this.viewContainerRef = viewContainerRef;
        this.ref = ref;
        this.el = el;
        this.renderer = renderer;
        this.differs = differs;
        this.localeHolderService = localeHolderService;
        this.elementRef = elementRef;
        this.onChange = new EventEmitter();
        this.rangeClicked = new EventEmitter();
        this.datesUpdated = new EventEmitter();
        this.startDateChanged = new EventEmitter();
        this.endDateChanged = new EventEmitter();
        this.clearClicked = new EventEmitter();
        this.dateLimit = null;
        this.showCancel = false;
        this.lockStartDate = false;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.closeOnAutoApply = true;
        this.notForChangesProperty = ['locale', 'endKey', 'startKey'];
        this.onChangeFn = Function.prototype;
        this.onTouched = Function.prototype;
        this.validatorChange = Function.prototype;
        this.localeHolder = {};
        this.endKey = 'endDate';
        this.startKey = 'startDate';
        this.drops = 'down';
        this.opens = 'auto';
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(DaterangepickerComponent);
        this.picker = componentRef.instance;
        this.picker.inline = false;
    }
    get disabled() {
        return this.disabledHolder;
    }
    set startKey(value) {
        if (value !== null) {
            this.startKeyHolder = value;
        }
        else {
            this.startKeyHolder = 'startDate';
        }
    }
    get locale() {
        return this.localeHolder;
    }
    set locale(value) {
        this.localeHolder = { ...this.localeHolderService.config, ...value };
    }
    set endKey(value) {
        if (value !== null) {
            this.endKeyHolder = value;
        }
        else {
            this.endKeyHolder = 'endDate';
        }
    }
    get value() {
        return this.valueHolder || null;
    }
    set value(val) {
        this.valueHolder = val;
        this.onChangeFn(val);
        this.ref.markForCheck();
    }
    outsideClick(event) {
        if (!event.target) {
            return;
        }
        if (event.target.classList.contains('ngx-daterangepicker-action')) {
            return;
        }
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.hide();
        }
    }
    hide(e) {
        this.picker.hide(e);
    }
    onBlur() {
        this.onTouched();
    }
    inputChanged(e) {
        if (e.target.tagName.toLowerCase() !== 'input') {
            return;
        }
        if (!e.target.value.length) {
            return;
        }
        const dateString = e.target.value.split(this.picker.locale.separator);
        let start = null;
        let end = null;
        if (dateString.length === 2) {
            start = dayjs(dateString[0], this.picker.locale.format);
            end = dayjs(dateString[1], this.picker.locale.format);
        }
        if (this.singleDatePicker || start === null || end === null) {
            start = dayjs(e.target.value, this.picker.locale.format);
            end = start;
        }
        if (!start.isValid() || !end.isValid()) {
            return;
        }
        this.picker.setStartDate(start);
        this.picker.setEndDate(end);
        this.picker.updateView();
    }
    open(event) {
        if (this.disabled) {
            return;
        }
        this.picker.show(event);
        setTimeout(() => {
            this.setPosition();
        });
    }
    ngOnInit() {
        this.picker.startDateChanged.asObservable().subscribe((itemChanged) => {
            this.startDateChanged.emit(itemChanged);
        });
        this.picker.endDateChanged.asObservable().subscribe((itemChanged) => {
            this.endDateChanged.emit(itemChanged);
        });
        this.picker.rangeClicked.asObservable().subscribe((range) => {
            this.rangeClicked.emit(range);
        });
        this.picker.datesUpdated.asObservable().subscribe((range) => {
            this.datesUpdated.emit(range);
        });
        this.picker.clearClicked.asObservable().subscribe(() => {
            this.clearClicked.emit();
        });
        this.picker.choosedDate.asObservable().subscribe((change) => {
            if (change) {
                const value = {
                    [this.startKeyHolder]: change.startDate,
                    [this.endKeyHolder]: change.endDate
                };
                this.value = value;
                this.onChange.emit(value);
                if (typeof change.chosenLabel === 'string') {
                    this.el.nativeElement.value = change.chosenLabel;
                }
            }
        });
        this.picker.firstMonthDayClass = this.firstMonthDayClass;
        this.picker.lastMonthDayClass = this.lastMonthDayClass;
        this.picker.emptyWeekRowClass = this.emptyWeekRowClass;
        this.picker.emptyWeekColumnClass = this.emptyWeekColumnClass;
        this.picker.firstDayOfNextMonthClass = this.firstDayOfNextMonthClass;
        this.picker.lastDayOfPreviousMonthClass = this.lastDayOfPreviousMonthClass;
        this.picker.drops = this.drops;
        this.picker.opens = this.opens;
        this.localeDiffer = this.differs.find(this.locale).create();
        this.picker.closeOnAutoApply = this.closeOnAutoApply;
    }
    ngOnChanges(changes) {
        for (const change in changes) {
            if (Object.prototype.hasOwnProperty.call(changes, change)) {
                if (this.notForChangesProperty.indexOf(change) === -1) {
                    this.picker[change] = changes[change].currentValue;
                }
            }
        }
    }
    ngDoCheck() {
        if (this.localeDiffer) {
            const changes = this.localeDiffer.diff(this.locale);
            if (changes) {
                this.picker.updateLocale(this.locale);
            }
        }
    }
    toggle(e) {
        if (this.picker.isShown) {
            this.hide(e);
        }
        else {
            this.open(e);
        }
    }
    clear() {
        this.picker.clear();
    }
    writeValue(value) {
        this.setValue(value);
    }
    registerOnChange(fn) {
        this.onChangeFn = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(state) {
        this.disabledHolder = state;
    }
    setPosition() {
        let style;
        let containerTop;
        const container = this.picker.pickerContainer.nativeElement;
        const element = this.el.nativeElement;
        if (this.drops && this.drops === 'up') {
            containerTop = element.offsetTop - container.clientHeight + 'px';
        }
        else {
            containerTop = 'auto';
        }
        if (this.opens === 'left') {
            style = {
                top: containerTop,
                left: 'auto',
                right: '0px'
            };
        }
        else if (this.opens === 'center') {
            style = {
                top: containerTop,
                left: element.offsetLeft + element.clientWidth / 2 - container.clientWidth / 2 + 'px',
                right: 'auto'
            };
        }
        else if (this.opens === 'right') {
            style = {
                top: containerTop,
                left: element.offsetLeft + 'px',
                right: 'auto'
            };
        }
        else {
            const position = element.offsetLeft + element.clientWidth / 2 - container.clientWidth / 2;
            if (position < 0) {
                style = {
                    top: containerTop,
                    left: element.offsetLeft + 'px',
                    right: 'auto'
                };
            }
            else {
                style = {
                    top: containerTop,
                    left: position + 'px',
                    right: 'auto'
                };
            }
        }
        if (style) {
            this.renderer.setStyle(container, 'top', style.top);
            this.renderer.setStyle(container, 'left', style.left);
            this.renderer.setStyle(container, 'right', style.right);
        }
    }
    setValue(val) {
        if (val) {
            this.value = val;
            if (val[this.startKeyHolder]) {
                this.picker.setStartDate(val[this.startKeyHolder]);
            }
            if (val[this.endKeyHolder]) {
                this.picker.setEndDate(val[this.endKeyHolder]);
            }
            this.picker.calculateChosenLabel();
            if (this.picker.chosenLabel) {
                this.el.nativeElement.value = this.picker.chosenLabel;
            }
        }
        else {
            this.picker.clear();
        }
    }
}
DaterangepickerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: DaterangepickerDirective, deps: [{ token: i0.ViewContainerRef }, { token: i0.ChangeDetectorRef }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: i0.KeyValueDiffers }, { token: i1.LocaleService }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
DaterangepickerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.11", type: DaterangepickerDirective, selector: "input[ngxDaterangepickerMd]", inputs: { minDate: "minDate", maxDate: "maxDate", autoApply: "autoApply", alwaysShowCalendars: "alwaysShowCalendars", showCustomRangeLabel: "showCustomRangeLabel", linkedCalendars: "linkedCalendars", dateLimit: "dateLimit", singleDatePicker: "singleDatePicker", showWeekNumbers: "showWeekNumbers", showISOWeekNumbers: "showISOWeekNumbers", showDropdowns: "showDropdowns", isInvalidDate: "isInvalidDate", isCustomDate: "isCustomDate", isTooltipDate: "isTooltipDate", showClearButton: "showClearButton", customRangeDirection: "customRangeDirection", ranges: "ranges", opens: "opens", drops: "drops", firstMonthDayClass: "firstMonthDayClass", lastMonthDayClass: "lastMonthDayClass", emptyWeekRowClass: "emptyWeekRowClass", emptyWeekColumnClass: "emptyWeekColumnClass", firstDayOfNextMonthClass: "firstDayOfNextMonthClass", lastDayOfPreviousMonthClass: "lastDayOfPreviousMonthClass", keepCalendarOpeningWithRange: "keepCalendarOpeningWithRange", showRangeLabelOnInput: "showRangeLabelOnInput", showCancel: "showCancel", lockStartDate: "lockStartDate", timePicker: "timePicker", timePicker24Hour: "timePicker24Hour", timePickerIncrement: "timePickerIncrement", timePickerSeconds: "timePickerSeconds", closeOnAutoApply: "closeOnAutoApply", endKeyHolder: "endKeyHolder", startKey: "startKey", locale: "locale", endKey: "endKey" }, outputs: { onChange: "change", rangeClicked: "rangeClicked", datesUpdated: "datesUpdated", startDateChanged: "startDateChanged", endDateChanged: "endDateChanged", clearClicked: "clearClicked" }, host: { listeners: { "document:click": "outsideClick($event)", "keyup.esc": "hide($event)", "blur": "onBlur()", "keyup": "inputChanged($event)", "click": "open($event)" }, properties: { "disabled": "this.disabled" } }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DaterangepickerDirective),
            multi: true
        }
    ], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: DaterangepickerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[ngxDaterangepickerMd]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => DaterangepickerDirective),
                            multi: true
                        }
                    ]
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }, { type: i0.ChangeDetectorRef }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: i0.KeyValueDiffers }, { type: i1.LocaleService }, { type: i0.ElementRef }]; }, propDecorators: { onChange: [{
                type: Output,
                args: ['change']
            }], rangeClicked: [{
                type: Output,
                args: ['rangeClicked']
            }], datesUpdated: [{
                type: Output,
                args: ['datesUpdated']
            }], startDateChanged: [{
                type: Output
            }], endDateChanged: [{
                type: Output
            }], clearClicked: [{
                type: Output
            }], minDate: [{
                type: Input
            }], maxDate: [{
                type: Input
            }], autoApply: [{
                type: Input
            }], alwaysShowCalendars: [{
                type: Input
            }], showCustomRangeLabel: [{
                type: Input
            }], linkedCalendars: [{
                type: Input
            }], dateLimit: [{
                type: Input
            }], singleDatePicker: [{
                type: Input
            }], showWeekNumbers: [{
                type: Input
            }], showISOWeekNumbers: [{
                type: Input
            }], showDropdowns: [{
                type: Input
            }], isInvalidDate: [{
                type: Input
            }], isCustomDate: [{
                type: Input
            }], isTooltipDate: [{
                type: Input
            }], showClearButton: [{
                type: Input
            }], customRangeDirection: [{
                type: Input
            }], ranges: [{
                type: Input
            }], opens: [{
                type: Input
            }], drops: [{
                type: Input
            }], firstMonthDayClass: [{
                type: Input
            }], lastMonthDayClass: [{
                type: Input
            }], emptyWeekRowClass: [{
                type: Input
            }], emptyWeekColumnClass: [{
                type: Input
            }], firstDayOfNextMonthClass: [{
                type: Input
            }], lastDayOfPreviousMonthClass: [{
                type: Input
            }], keepCalendarOpeningWithRange: [{
                type: Input
            }], showRangeLabelOnInput: [{
                type: Input
            }], showCancel: [{
                type: Input
            }], lockStartDate: [{
                type: Input
            }], timePicker: [{
                type: Input
            }], timePicker24Hour: [{
                type: Input
            }], timePickerIncrement: [{
                type: Input
            }], timePickerSeconds: [{
                type: Input
            }], closeOnAutoApply: [{
                type: Input
            }], endKeyHolder: [{
                type: Input
            }], disabled: [{
                type: HostBinding,
                args: ['disabled']
            }], startKey: [{
                type: Input
            }], locale: [{
                type: Input
            }], endKey: [{
                type: Input
            }], outsideClick: [{
                type: HostListener,
                args: ['document:click', ['$event']]
            }], hide: [{
                type: HostListener,
                args: ['keyup.esc', ['$event']]
            }], onBlur: [{
                type: HostListener,
                args: ['blur']
            }], inputChanged: [{
                type: HostListener,
                args: ['keyup', ['$event']]
            }], open: [{
                type: HostListener,
                args: ['click', ['$event']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXJhbmdlcGlja2VyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRlcmFuZ2VwaWNrZXIvZGF0ZXJhbmdlcGlja2VyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixpQkFBaUIsRUFJakIsS0FBSyxFQUdMLGVBQWUsRUFDZixNQUFNLEVBQ04sWUFBWSxFQUNaLFNBQVMsRUFDVCxXQUFXLEVBQ1osTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUF5Qix3QkFBd0IsRUFBOEMsTUFBTSw2QkFBNkIsQ0FBQztBQUMxSSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssTUFBTSxXQUFXLENBQUM7QUFFOUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDOzs7QUFjakQsTUFBTSxPQUFPLHdCQUF3QjtJQThIbkMsWUFDUyxnQkFBa0MsRUFDbEMsR0FBc0IsRUFDckIsRUFBYyxFQUNkLFFBQW1CLEVBQ25CLE9BQXdCLEVBQ3hCLG1CQUFrQyxFQUNsQyxVQUFzQjtRQU52QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBQ3JCLE9BQUUsR0FBRixFQUFFLENBQVk7UUFDZCxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQ25CLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBQ3hCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBZTtRQUNsQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBbklkLGFBQVEsR0FBb0MsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV6RCxpQkFBWSxHQUE0QixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRTNELGlCQUFZLEdBQTZCLElBQUksWUFBWSxFQUFFLENB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LFlBQVk7dUJBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBWaWV3Q29udGFpbmVyUmVmLFxuICBFbGVtZW50UmVmLFxuICBIb3N0TGlzdGVuZXIsXG4gIGZvcndhcmRSZWYsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkluaXQsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgSW5wdXQsXG4gIERvQ2hlY2ssXG4gIEtleVZhbHVlRGlmZmVyLFxuICBLZXlWYWx1ZURpZmZlcnMsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBSZW5kZXJlcjIsXG4gIEhvc3RCaW5kaW5nXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ2hvc2VuRGF0ZSwgRGF0ZVJhbmdlLCBEYXRlcmFuZ2VwaWNrZXJDb21wb25lbnQsIERhdGVSYW5nZXMsIEVuZERhdGUsIFN0YXJ0RGF0ZSwgVGltZVBlcmlvZCB9IGZyb20gJy4vZGF0ZXJhbmdlcGlja2VyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOR19WQUxVRV9BQ0NFU1NPUiB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCBkYXlqcyBmcm9tICdkYXlqcy9lc20nO1xuaW1wb3J0IHsgTG9jYWxlQ29uZmlnIH0gZnJvbSAnLi9kYXRlcmFuZ2VwaWNrZXIuY29uZmlnJztcbmltcG9ydCB7IExvY2FsZVNlcnZpY2UgfSBmcm9tICcuL2xvY2FsZS5zZXJ2aWNlJztcblxuQERpcmVjdGl2ZSh7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAYW5ndWxhci1lc2xpbnQvZGlyZWN0aXZlLXNlbGVjdG9yXG4gIHNlbGVjdG9yOiAnaW5wdXRbbmd4RGF0ZXJhbmdlcGlja2VyTWRdJyxcbiAgcHJvdmlkZXJzOiBbXG4gICAge1xuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBEYXRlcmFuZ2VwaWNrZXJEaXJlY3RpdmUpLFxuICAgICAgbXVsdGk6IHRydWVcbiAgICB9XG4gIF1cbn0pXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L25vLWNvbmZsaWN0aW5nLWxpZmVjeWNsZVxuZXhwb3J0IGNsYXNzIERhdGVyYW5nZXBpY2tlckRpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9uby1vdXRwdXQtb24tcHJlZml4LEBhbmd1bGFyLWVzbGludC9uby1vdXRwdXQtbmF0aXZlLEBhbmd1bGFyLWVzbGludC9uby1vdXRwdXQtcmVuYW1lXG4gIEBPdXRwdXQoJ2NoYW5nZScpIG9uQ2hhbmdlOiBFdmVudEVtaXR0ZXI8VGltZVBlcmlvZCB8IG51bGw+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L25vLW91dHB1dC1yZW5hbWVcbiAgQE91dHB1dCgncmFuZ2VDbGlja2VkJykgcmFuZ2VDbGlja2VkOiBFdmVudEVtaXR0ZXI8RGF0ZVJhbmdlPiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEBhbmd1bGFyLWVzbGludC9uby1vdXRwdXQtcmVuYW1lXG4gIEBPdXRwdXQoJ2RhdGVzVXBkYXRlZCcpIGRhdGVzVXBkYXRlZDogRXZlbnRFbWl0dGVyPFRpbWVQZXJpb2Q+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgc3RhcnREYXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPFN0YXJ0RGF0ZT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBlbmREYXRlQ2hhbmdlZDogRXZlbnRFbWl0dGVyPEVuZERhdGU+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgY2xlYXJDbGlja2VkOiBFdmVudEVtaXR0ZXI8dm9pZD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQElucHV0KClcbiAgbWluRGF0ZTogZGF5anMuRGF5anM7XG5cbiAgQElucHV0KClcbiAgbWF4RGF0ZTogZGF5anMuRGF5anM7XG5cbiAgQElucHV0KClcbiAgYXV0b0FwcGx5OiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIGFsd2F5c1Nob3dDYWxlbmRhcnM6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgc2hvd0N1c3RvbVJhbmdlTGFiZWw6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgbGlua2VkQ2FsZW5kYXJzOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIGRhdGVMaW1pdDogbnVtYmVyID0gbnVsbDtcblxuICBASW5wdXQoKVxuICBzaW5nbGVEYXRlUGlja2VyOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHNob3dXZWVrTnVtYmVyczogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBzaG93SVNPV2Vla051bWJlcnM6IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgc2hvd0Ryb3Bkb3duczogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBpc0ludmFsaWREYXRlOiAoRGF5anMpID0+IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgaXNDdXN0b21EYXRlOiAoRGF5anMpID0+IHN0cmluZyB8IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgaXNUb29sdGlwRGF0ZTogKERheWpzKSA9PiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbDtcblxuICBASW5wdXQoKVxuICBzaG93Q2xlYXJCdXR0b246IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgY3VzdG9tUmFuZ2VEaXJlY3Rpb246IGJvb2xlYW47XG5cbiAgQElucHV0KClcbiAgcmFuZ2VzOiBEYXRlUmFuZ2VzO1xuXG4gIEBJbnB1dCgpXG4gIG9wZW5zOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgZHJvcHM6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBmaXJzdE1vbnRoRGF5Q2xhc3M6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBsYXN0TW9udGhEYXlDbGFzczogc3RyaW5nO1xuXG4gIEBJbnB1dCgpXG4gIGVtcHR5V2Vla1Jvd0NsYXNzOiBzdHJpbmc7XG5cbiAgQElucHV0KClcbiAgZW1wdHlXZWVrQ29sdW1uQ2xhc3M6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBmaXJzdERheU9mTmV4dE1vbnRoQ2xhc3M6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBsYXN0RGF5T2ZQcmV2aW91c01vbnRoQ2xhc3M6IHN0cmluZztcblxuICBASW5wdXQoKVxuICBrZWVwQ2FsZW5kYXJPcGVuaW5nV2l0aFJhbmdlOiBib29sZWFuO1xuXG4gIEBJbnB1dCgpXG4gIHNob3dSYW5nZUxhYmVsT25JbnB1dDogYm9vbGVhbjtcblxuICBASW5wdXQoKVxuICBzaG93Q2FuY2VsID0gZmFsc2U7XG5cbiAgQElucHV0KClcbiAgbG9ja1N0YXJ0RGF0ZSA9IGZhbHNlO1xuXG4gIC8vIHRpbWVwaWNrZXIgdmFyaWFibGVzXG4gIEBJbnB1dCgpXG4gIHRpbWVQaWNrZXIgPSBmYWxzZTtcblxuICBASW5wdXQoKVxuICB0aW1lUGlja2VyMjRIb3VyID0gZmFsc2U7XG5cbiAgQElucHV0KClcbiAgdGltZVBpY2tlckluY3JlbWVudCA9IDE7XG5cbiAgQElucHV0KClcbiAgdGltZVBpY2tlclNlY29uZHMgPSBmYWxzZTtcblxuICBASW5wdXQoKSBjbG9zZU9uQXV0b0FwcGx5ID0gdHJ1ZTtcbiAgQElucHV0KClcbiAgcHJpdmF0ZSBlbmRLZXlIb2xkZXI6IHN0cmluZztcblxuICBwdWJsaWMgcGlja2VyOiBEYXRlcmFuZ2VwaWNrZXJDb21wb25lbnQ7XG4gIHByaXZhdGUgc3RhcnRLZXlIb2xkZXI6IHN0cmluZztcbiAgcHJpdmF0ZSBub3RGb3JDaGFuZ2VzUHJvcGVydHk6IEFycmF5PHN0cmluZz4gPSBbJ2xvY2FsZScsICdlbmRLZXknLCAnc3RhcnRLZXknXTtcbiAgcHJpdmF0ZSBvbkNoYW5nZUZuID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICBwcml2YXRlIG9uVG91Y2hlZCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgcHJpdmF0ZSB2YWxpZGF0b3JDaGFuZ2UgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gIHByaXZhdGUgZGlzYWJsZWRIb2xkZXI6IGJvb2xlYW47XG4gIHByaXZhdGUgdmFsdWVIb2xkZXI6IFRpbWVQZXJpb2QgfCBudWxsO1xuICBwcml2YXRlIGxvY2FsZURpZmZlcjogS2V5VmFsdWVEaWZmZXI8c3RyaW5nLCBhbnk+O1xuICBwcml2YXRlIGxvY2FsZUhvbGRlcjogTG9jYWxlQ29uZmlnID0ge307XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgcHVibGljIHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgcHJpdmF0ZSBlbDogRWxlbWVudFJlZixcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgcHJpdmF0ZSBkaWZmZXJzOiBLZXlWYWx1ZURpZmZlcnMsXG4gICAgcHJpdmF0ZSBsb2NhbGVIb2xkZXJTZXJ2aWNlOiBMb2NhbGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZlxuICApIHtcbiAgICB0aGlzLmVuZEtleSA9ICdlbmREYXRlJztcbiAgICB0aGlzLnN0YXJ0S2V5ID0gJ3N0YXJ0RGF0ZSc7XG4gICAgdGhpcy5kcm9wcyA9ICdkb3duJztcbiAgICB0aGlzLm9wZW5zID0gJ2F1dG8nO1xuICAgIHZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgICBjb25zdCBjb21wb25lbnRSZWYgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChEYXRlcmFuZ2VwaWNrZXJDb21wb25lbnQpO1xuICAgIHRoaXMucGlja2VyID0gY29tcG9uZW50UmVmLmluc3RhbmNlIGFzIERhdGVyYW5nZXBpY2tlckNvbXBvbmVudDtcbiAgICB0aGlzLnBpY2tlci5pbmxpbmUgPSBmYWxzZTsgLy8gc2V0IGlubGluZSB0byBmYWxzZSBmb3IgYWxsIGRpcmVjdGl2ZSB1c2FnZVxuICB9XG5cbiAgQEhvc3RCaW5kaW5nKCdkaXNhYmxlZCcpIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZEhvbGRlcjtcbiAgfVxuXG4gIEBJbnB1dCgpIHNldCBzdGFydEtleSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXJ0S2V5SG9sZGVyID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRLZXlIb2xkZXIgPSAnc3RhcnREYXRlJztcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L21lbWJlci1vcmRlcmluZ1xuICBnZXQgbG9jYWxlKCk6IExvY2FsZUNvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMubG9jYWxlSG9sZGVyO1xuICB9XG5cbiAgQElucHV0KCkgc2V0IGxvY2FsZSh2YWx1ZTogTG9jYWxlQ29uZmlnKSB7XG4gICAgdGhpcy5sb2NhbGVIb2xkZXIgPSB7IC4uLnRoaXMubG9jYWxlSG9sZGVyU2VydmljZS5jb25maWcsIC4uLnZhbHVlIH07XG4gIH1cblxuICBASW5wdXQoKSBzZXQgZW5kS2V5KHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuZW5kS2V5SG9sZGVyID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW5kS2V5SG9sZGVyID0gJ2VuZERhdGUnO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbWVtYmVyLW9yZGVyaW5nXG4gIGdldCB2YWx1ZSgpOiBUaW1lUGVyaW9kIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVIb2xkZXIgfHwgbnVsbDtcbiAgfVxuXG4gIHNldCB2YWx1ZSh2YWw6IFRpbWVQZXJpb2QgfCBudWxsKSB7XG4gICAgdGhpcy52YWx1ZUhvbGRlciA9IHZhbDtcbiAgICB0aGlzLm9uQ2hhbmdlRm4odmFsKTtcbiAgICB0aGlzLnJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgY2xpY2sgb3V0c2lkZSB0aGUgY2FsZW5kYXIncyBjb250YWluZXJcbiAgICpcbiAgICogQHBhcmFtIGV2ZW50IGV2ZW50IG9iamVjdFxuICAgKi9cbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6Y2xpY2snLCBbJyRldmVudCddKVxuICBvdXRzaWRlQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKCFldmVudC50YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoKGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuY2xhc3NMaXN0LmNvbnRhaW5zKCduZ3gtZGF0ZXJhbmdlcGlja2VyLWFjdGlvbicpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQpKSB7XG4gICAgICB0aGlzLmhpZGUoKTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXl1cC5lc2MnLCBbJyRldmVudCddKVxuICBoaWRlKGU/OiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMucGlja2VyLmhpZGUoZSk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdibHVyJylcbiAgb25CbHVyKCk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkKCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXl1cCcsIFsnJGV2ZW50J10pXG4gIGlucHV0Q2hhbmdlZChlOiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgaWYgKChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSAnaW5wdXQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkYXRlU3RyaW5nID0gKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlLnNwbGl0KHRoaXMucGlja2VyLmxvY2FsZS5zZXBhcmF0b3IpO1xuICAgIGxldCBzdGFydCA9IG51bGw7XG4gICAgbGV0IGVuZCA9IG51bGw7XG4gICAgaWYgKGRhdGVTdHJpbmcubGVuZ3RoID09PSAyKSB7XG4gICAgICBzdGFydCA9IGRheWpzKGRhdGVTdHJpbmdbMF0sIHRoaXMucGlja2VyLmxvY2FsZS5mb3JtYXQpO1xuICAgICAgZW5kID0gZGF5anMoZGF0ZVN0cmluZ1sxXSwgdGhpcy5waWNrZXIubG9jYWxlLmZvcm1hdCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNpbmdsZURhdGVQaWNrZXIgfHwgc3RhcnQgPT09IG51bGwgfHwgZW5kID09PSBudWxsKSB7XG4gICAgICBzdGFydCA9IGRheWpzKChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSwgdGhpcy5waWNrZXIubG9jYWxlLmZvcm1hdCk7XG4gICAgICBlbmQgPSBzdGFydDtcbiAgICB9XG4gICAgaWYgKCFzdGFydC5pc1ZhbGlkKCkgfHwgIWVuZC5pc1ZhbGlkKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5waWNrZXIuc2V0U3RhcnREYXRlKHN0YXJ0KTtcbiAgICB0aGlzLnBpY2tlci5zZXRFbmREYXRlKGVuZCk7XG4gICAgdGhpcy5waWNrZXIudXBkYXRlVmlldygpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudCddKVxuICBvcGVuKGV2ZW50PzogRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnBpY2tlci5zaG93KGV2ZW50KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAYW5ndWxhci1lc2xpbnQvbm8tY29uZmxpY3RpbmctbGlmZWN5Y2xlXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMucGlja2VyLnN0YXJ0RGF0ZUNoYW5nZWQuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChpdGVtQ2hhbmdlZDogU3RhcnREYXRlKSA9PiB7XG4gICAgICB0aGlzLnN0YXJ0RGF0ZUNoYW5nZWQuZW1pdChpdGVtQ2hhbmdlZCk7XG4gICAgfSk7XG4gICAgdGhpcy5waWNrZXIuZW5kRGF0ZUNoYW5nZWQuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChpdGVtQ2hhbmdlZDogRW5kRGF0ZSkgPT4ge1xuICAgICAgdGhpcy5lbmREYXRlQ2hhbmdlZC5lbWl0KGl0ZW1DaGFuZ2VkKTtcbiAgICB9KTtcbiAgICB0aGlzLnBpY2tlci5yYW5nZUNsaWNrZWQuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChyYW5nZTogRGF0ZVJhbmdlKSA9PiB7XG4gICAgICB0aGlzLnJhbmdlQ2xpY2tlZC5lbWl0KHJhbmdlKTtcbiAgICB9KTtcbiAgICB0aGlzLnBpY2tlci5kYXRlc1VwZGF0ZWQuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChyYW5nZTogVGltZVBlcmlvZCkgPT4ge1xuICAgICAgdGhpcy5kYXRlc1VwZGF0ZWQuZW1pdChyYW5nZSk7XG4gICAgfSk7XG4gICAgdGhpcy5waWNrZXIuY2xlYXJDbGlja2VkLmFzT2JzZXJ2YWJsZSgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmNsZWFyQ2xpY2tlZC5lbWl0KCk7XG4gICAgfSk7XG4gICAgdGhpcy5waWNrZXIuY2hvb3NlZERhdGUuYXNPYnNlcnZhYmxlKCkuc3Vic2NyaWJlKChjaGFuZ2U6IENob3NlbkRhdGUpID0+IHtcbiAgICAgIGlmIChjaGFuZ2UpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB7XG4gICAgICAgICAgW3RoaXMuc3RhcnRLZXlIb2xkZXJdOiBjaGFuZ2Uuc3RhcnREYXRlLFxuICAgICAgICAgIFt0aGlzLmVuZEtleUhvbGRlcl06IGNoYW5nZS5lbmREYXRlXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZSBhcyBUaW1lUGVyaW9kO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlLmVtaXQodmFsdWUgYXMgVGltZVBlcmlvZCk7XG4gICAgICAgIGlmICh0eXBlb2YgY2hhbmdlLmNob3NlbkxhYmVsID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC52YWx1ZSA9IGNoYW5nZS5jaG9zZW5MYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMucGlja2VyLmZpcnN0TW9udGhEYXlDbGFzcyA9IHRoaXMuZmlyc3RNb250aERheUNsYXNzO1xuICAgIHRoaXMucGlja2VyLmxhc3RNb250aERheUNsYXNzID0gdGhpcy5sYXN0TW9udGhEYXlDbGFzcztcbiAgICB0aGlzLnBpY2tlci5lbXB0eVdlZWtSb3dDbGFzcyA9IHRoaXMuZW1wdHlXZWVrUm93Q2xhc3M7XG4gICAgdGhpcy5waWNrZXIuZW1wdHlXZWVrQ29sdW1uQ2xhc3MgPSB0aGlzLmVtcHR5V2Vla0NvbHVtbkNsYXNzO1xuICAgIHRoaXMucGlja2VyLmZpcnN0RGF5T2ZOZXh0TW9udGhDbGFzcyA9IHRoaXMuZmlyc3REYXlPZk5leHRNb250aENsYXNzO1xuICAgIHRoaXMucGlja2VyLmxhc3REYXlPZlByZXZpb3VzTW9udGhDbGFzcyA9IHRoaXMubGFzdERheU9mUHJldmlvdXNNb250aENsYXNzO1xuICAgIHRoaXMucGlja2VyLmRyb3BzID0gdGhpcy5kcm9wcztcbiAgICB0aGlzLnBpY2tlci5vcGVucyA9IHRoaXMub3BlbnM7XG4gICAgdGhpcy5sb2NhbGVEaWZmZXIgPSB0aGlzLmRpZmZlcnMuZmluZCh0aGlzLmxvY2FsZSkuY3JlYXRlKCk7XG4gICAgdGhpcy5waWNrZXIuY2xvc2VPbkF1dG9BcHBseSA9IHRoaXMuY2xvc2VPbkF1dG9BcHBseTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAYW5ndWxhci1lc2xpbnQvbm8tY29uZmxpY3RpbmctbGlmZWN5Y2xlXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBpbiBjaGFuZ2VzKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNoYW5nZXMsIGNoYW5nZSkpIHtcbiAgICAgICAgaWYgKHRoaXMubm90Rm9yQ2hhbmdlc1Byb3BlcnR5LmluZGV4T2YoY2hhbmdlKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLnBpY2tlcltjaGFuZ2VdID0gY2hhbmdlc1tjaGFuZ2VdLmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAYW5ndWxhci1lc2xpbnQvbm8tY29uZmxpY3RpbmctbGlmZWN5Y2xlXG4gIG5nRG9DaGVjaygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5sb2NhbGVEaWZmZXIpIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLmxvY2FsZURpZmZlci5kaWZmKHRoaXMubG9jYWxlKTtcbiAgICAgIGlmIChjaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMucGlja2VyLnVwZGF0ZUxvY2FsZSh0aGlzLmxvY2FsZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlKGU/OiBFdmVudCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnBpY2tlci5pc1Nob3duKSB7XG4gICAgICB0aGlzLmhpZGUoZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3BlbihlKTtcbiAgICB9XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLnBpY2tlci5jbGVhcigpO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogVGltZVBlcmlvZCk6IHZvaWQge1xuICAgIHRoaXMuc2V0VmFsdWUodmFsdWUpO1xuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKCkgPT4gVGltZVBlcmlvZCB8IG51bGwpOiB2b2lkIHtcbiAgICB0aGlzLm9uQ2hhbmdlRm4gPSBmbjtcbiAgfVxuXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoc3RhdGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmRpc2FibGVkSG9sZGVyID0gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBvc2l0aW9uIG9mIHRoZSBjYWxlbmRhclxuICAgKi9cbiAgc2V0UG9zaXRpb24oKTogdm9pZCB7XG4gICAgbGV0IHN0eWxlO1xuICAgIGxldCBjb250YWluZXJUb3A7XG4gICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5waWNrZXIucGlja2VyQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQ7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudDtcbiAgICBpZiAodGhpcy5kcm9wcyAmJiB0aGlzLmRyb3BzID09PSAndXAnKSB7XG4gICAgICBjb250YWluZXJUb3AgPSBlbGVtZW50Lm9mZnNldFRvcCAtIGNvbnRhaW5lci5jbGllbnRIZWlnaHQgKyAncHgnO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXJUb3AgPSAnYXV0byc7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wZW5zID09PSAnbGVmdCcpIHtcbiAgICAgIHN0eWxlID0ge1xuICAgICAgICB0b3A6IGNvbnRhaW5lclRvcCxcbiAgICAgICAgbGVmdDogJ2F1dG8nLFxuICAgICAgICByaWdodDogJzBweCdcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wZW5zID09PSAnY2VudGVyJykge1xuICAgICAgc3R5bGUgPSB7XG4gICAgICAgIHRvcDogY29udGFpbmVyVG9wLFxuICAgICAgICBsZWZ0OiBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50LmNsaWVudFdpZHRoIC8gMiAtIGNvbnRhaW5lci5jbGllbnRXaWR0aCAvIDIgKyAncHgnLFxuICAgICAgICByaWdodDogJ2F1dG8nXG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcGVucyA9PT0gJ3JpZ2h0Jykge1xuICAgICAgc3R5bGUgPSB7XG4gICAgICAgIHRvcDogY29udGFpbmVyVG9wLFxuICAgICAgICBsZWZ0OiBlbGVtZW50Lm9mZnNldExlZnQgKyAncHgnLFxuICAgICAgICByaWdodDogJ2F1dG8nXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGVsZW1lbnQub2Zmc2V0TGVmdCArIGVsZW1lbnQuY2xpZW50V2lkdGggLyAyIC0gY29udGFpbmVyLmNsaWVudFdpZHRoIC8gMjtcbiAgICAgIGlmIChwb3NpdGlvbiA8IDApIHtcbiAgICAgICAgc3R5bGUgPSB7XG4gICAgICAgICAgdG9wOiBjb250YWluZXJUb3AsXG4gICAgICAgICAgbGVmdDogZWxlbWVudC5vZmZzZXRMZWZ0ICsgJ3B4JyxcbiAgICAgICAgICByaWdodDogJ2F1dG8nXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHlsZSA9IHtcbiAgICAgICAgICB0b3A6IGNvbnRhaW5lclRvcCxcbiAgICAgICAgICBsZWZ0OiBwb3NpdGlvbiArICdweCcsXG4gICAgICAgICAgcmlnaHQ6ICdhdXRvJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3R5bGUpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoY29udGFpbmVyLCAndG9wJywgc3R5bGUudG9wKTtcbiAgICAgIHRoaXMucmVuZGVyZXIuc2V0U3R5bGUoY29udGFpbmVyLCAnbGVmdCcsIHN0eWxlLmxlZnQpO1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZShjb250YWluZXIsICdyaWdodCcsIHN0eWxlLnJpZ2h0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldFZhbHVlKHZhbDogVGltZVBlcmlvZCkge1xuICAgIGlmICh2YWwpIHtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gICAgICBpZiAodmFsW3RoaXMuc3RhcnRLZXlIb2xkZXJdKSB7XG4gICAgICAgIHRoaXMucGlja2VyLnNldFN0YXJ0RGF0ZSh2YWxbdGhpcy5zdGFydEtleUhvbGRlcl0pO1xuICAgICAgfVxuICAgICAgaWYgKHZhbFt0aGlzLmVuZEtleUhvbGRlcl0pIHtcbiAgICAgICAgdGhpcy5waWNrZXIuc2V0RW5kRGF0ZSh2YWxbdGhpcy5lbmRLZXlIb2xkZXJdKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGlja2VyLmNhbGN1bGF0ZUNob3NlbkxhYmVsKCk7XG4gICAgICBpZiAodGhpcy5waWNrZXIuY2hvc2VuTGFiZWwpIHtcbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnZhbHVlID0gdGhpcy5waWNrZXIuY2hvc2VuTGFiZWw7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGlja2VyLmNsZWFyKCk7XG4gICAgfVxuICB9XG59XG4iXX0=