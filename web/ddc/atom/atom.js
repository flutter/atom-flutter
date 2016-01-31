dart_library.library('atom/atom', null, /* Imports */[
  'dart/_runtime',
  'logging/logging',
  'dart/core',
  'dart/js',
  'atom/src/js',
  'atom/utils/disposable',
  'dart/html',
  'dart/convert',
  'dart/async',
  'atom/src/utils',
  'atom/node/node'
], /* Lazy imports */[
], function(exports$, dart, logging, core, js, js$, disposable, html, convert, async, utils, node) {
  'use strict';
  let dartx = dart.dartx;
  dart.defineLazyProperties(exports$, {
    get _logger() {
      return logging.Logger.new('atom');
    }
  });
  dart.defineLazyProperties(exports$, {
    get atom() {
      return new Atom();
    }
  });
  exports$._package = null;
  const _registeredMethods = Symbol('_registeredMethods');
  function registerPackage(package$) {
    if (exports$._package != null) {
      dart.throw(new core.StateError('can only register one package'));
    }
    exports$._package = package$;
    let exports = dart.as(dart.dindex(js.context.get('module'), 'exports'), js.JsObject);
    exports.set('activate', dart.fn(state => {
      if (state === void 0) state = null;
      try {
        exports$._package.activate(state);
      } catch (e) {
        let st = dart.stackTrace(e);
        core.print(`${e}`);
        core.print(`${st}`);
      }

    }, dart.dynamic, [], [dart.dynamic]));
    exports.set('deactivate', dart.fn(() => {
      try {
        exports$._package.deactivate();
      } catch (e) {
        let st = dart.stackTrace(e);
        core.print(`${e}`);
        core.print(`${st}`);
      }

    }));
    exports.set('config', js$.jsify(exports$._package.config()));
    exports.set('serialize', dart.bind(exports$._package, 'serialize'));
    package$[_registeredMethods].forEach(dart.fn((methodName, f) => {
      exports.set(methodName, dart.fn(arg => {
        let result = dart.dcall(f, arg);
        if (dart.is(result, disposable.Disposable)) {
          let m = dart.map({dispose: dart.bind(result, 'dispose')});
          return js$.jsify(m);
        } else if (dart.is(result, core.List) || dart.is(result, core.Map)) {
          return js$.jsify(result);
        } else if (dart.is(result, js.JsObject)) {
          return result;
        } else {
          return null;
        }
      }));
    }, dart.void, [core.String, core.Function]));
    package$[_registeredMethods] = null;
  }
  dart.fn(registerPackage, () => dart.definiteFunctionType(dart.void, [AtomPackage]));
  function registerPackageDDC(package$) {
    let packageInfo = dart.map({activate: dart.fn(state => {
        if (state === void 0) state = null;
        try {
          package$.activate(state);
        } catch (e) {
          let st = dart.stackTrace(e);
          core.print(`${e}`);
          core.print(`${st}`);
        }

      }, dart.dynamic, [], [dart.dynamic]), deactivate: dart.fn(() => {
        try {
          package$.deactivate();
        } catch (e) {
          let st = dart.stackTrace(e);
          core.print(`${e}`);
          core.print(`${st}`);
        }

      }), config: package$.config(), serialize: dart.bind(package$, 'serialize')});
    js.context.set(package$.id, js$.jsify(packageInfo));
  }
  dart.fn(registerPackageDDC, () => dart.definiteFunctionType(dart.void, [AtomPackage]));
  class AtomPackage extends core.Object {
    AtomPackage(id) {
      this[_registeredMethods] = dart.map();
      this.id = id;
    }
    config() {
      return dart.map();
    }
    serialize() {
      return dart.map();
    }
    deactivate() {}
    loadPackageJson() {
      return dart.as(dart.as(html.HttpRequest.getString(`atom://${this.id}/package.json`).then(dart.fn(str => {
        return convert.JSON.decode(str);
      }, dart.dynamic, [core.String])), async.Future$(core.Map)), async.Future$(core.Map$(core.String, dart.dynamic)));
    }
    getPackageVersion() {
      return dart.as(this.loadPackageJson().then(dart.fn(map => map.get('version'), dart.dynamic, [core.Map])), async.Future$(core.String));
    }
  }
  dart.setSignature(AtomPackage, {
    constructors: () => ({AtomPackage: [AtomPackage, [core.String]]}),
    methods: () => ({
      config: [core.Map, []],
      serialize: [dart.dynamic, []],
      deactivate: [dart.void, []],
      loadPackageJson: [async.Future$(core.Map$(core.String, dart.dynamic)), []],
      getPackageVersion: [async.Future$(core.String), []]
    })
  });
  const _commands = Symbol('_commands');
  const _config = Symbol('_config');
  const _notifications = Symbol('_notifications');
  const _packages = Symbol('_packages');
  const _views = Symbol('_views');
  const _workspace = Symbol('_workspace');
  class Atom extends js$.ProxyHolder {
    Atom() {
      this[_commands] = null;
      this[_config] = null;
      this[_notifications] = null;
      this[_packages] = null;
      this[_views] = null;
      this[_workspace] = null;
      super.ProxyHolder(dart.as(js.context.get('atom'), js.JsObject));
      this[_commands] = new CommandRegistry(dart.as(this.obj.get('commands'), js.JsObject));
      this[_config] = new Config(dart.as(this.obj.get('config'), js.JsObject));
      this[_notifications] = new NotificationManager(dart.as(this.obj.get('notifications'), js.JsObject));
      this[_packages] = new PackageManager(dart.as(this.obj.get('packages'), js.JsObject));
      this[_views] = new ViewRegistry(dart.as(this.obj.get('views'), js.JsObject));
      this[_workspace] = new Workspace(dart.as(this.obj.get('workspace'), js.JsObject));
    }
    get commands() {
      return this[_commands];
    }
    get config() {
      return this[_config];
    }
    get notifications() {
      return this[_notifications];
    }
    get packages() {
      return this[_packages];
    }
    get views() {
      return this[_views];
    }
    get workspace() {
      return this[_workspace];
    }
    getVersion() {
      return dart.as(this.invoke('getVersion'), core.String);
    }
    beep() {
      return this.invoke('beep');
    }
    confirm(message, opts) {
      let detailedMessage = opts && 'detailedMessage' in opts ? opts.detailedMessage : null;
      let buttons = opts && 'buttons' in opts ? opts.buttons : null;
      let m = dart.map({message: message});
      if (detailedMessage != null) m.set('detailedMessage', detailedMessage);
      if (buttons != null) m.set('buttons', buttons);
      return dart.as(this.invoke('confirm', m), core.int);
    }
    reload() {
      return this.invoke('reload');
    }
    pickFolder() {
      let completer = async.Completer$(core.String).new();
      this.invoke('pickFolder', dart.fn(result => {
        if (dart.is(result, core.List) && dart.notNull(result[dartx.isNotEmpty])) {
          completer.complete(result[dartx.first]);
        } else {
          completer.complete(null);
        }
      }));
      return completer.future;
    }
  }
  dart.setSignature(Atom, {
    constructors: () => ({Atom: [Atom, []]}),
    methods: () => ({
      getVersion: [core.String, []],
      beep: [dart.void, []],
      confirm: [core.int, [core.String], {detailedMessage: core.String, buttons: core.List$(core.String)}],
      reload: [dart.void, []],
      pickFolder: [async.Future$(core.String), []]
    })
  });
  const _dispatchedController = Symbol('_dispatchedController');
  class CommandRegistry extends js$.ProxyHolder {
    CommandRegistry(object) {
      this[_dispatchedController] = async.StreamController$(core.String).broadcast();
      super.ProxyHolder(object);
    }
    get onDidDispatch() {
      return this[_dispatchedController].stream;
    }
    add(target, commandName, callback) {
      return new js$.JsDisposable(dart.as(this.invoke('add', target, commandName, dart.fn(e => {
        this[_dispatchedController].add(commandName);
        callback(AtomEvent.new(e));
      })), js.JsObject));
    }
    dispatch(target, commandName, opts) {
      let options = opts && 'options' in opts ? opts.options : null;
      return this.invoke('dispatch', target, commandName, options);
    }
  }
  dart.setSignature(CommandRegistry, {
    constructors: () => ({CommandRegistry: [CommandRegistry, [js.JsObject]]}),
    methods: () => ({
      add: [disposable.Disposable, [dart.dynamic, core.String, dart.functionType(dart.void, [AtomEvent])]],
      dispatch: [dart.void, [html.Element, core.String], {options: core.Map}]
    })
  });
  class Config extends js$.ProxyHolder {
    Config(object) {
      super.ProxyHolder(object);
    }
    getValue(keyPath, opts) {
      let scope = opts && 'scope' in opts ? opts.scope : null;
      let options = null;
      if (scope != null) options = dart.map({scope: scope});
      return this.invoke('get', keyPath, options);
    }
    getBoolValue(keyPath, opts) {
      let scope = opts && 'scope' in opts ? opts.scope : null;
      return dart.equals(this.getValue(keyPath, {scope: scope}), true);
    }
    setValue(keyPath, value) {
      return this.invoke('set', keyPath, value);
    }
    observe(keyPath, options, callback) {
      if (options == null) options = dart.map();
      return new js$.JsDisposable(dart.as(this.invoke('observe', keyPath, options, callback), js.JsObject));
    }
  }
  dart.setSignature(Config, {
    constructors: () => ({Config: [Config, [js.JsObject]]}),
    methods: () => ({
      getValue: [dart.dynamic, [core.String], {scope: dart.dynamic}],
      getBoolValue: [core.bool, [core.String], {scope: dart.dynamic}],
      setValue: [dart.void, [core.String, dart.dynamic]],
      observe: [disposable.Disposable, [core.String, core.Map, dart.functionType(dart.void, [dart.dynamic])]]
    })
  });
  const _options = Symbol('_options');
  class NotificationManager extends js$.ProxyHolder {
    NotificationManager(object) {
      super.ProxyHolder(object);
    }
    addSuccess(message, opts) {
      let detail = opts && 'detail' in opts ? opts.detail : null;
      let description = opts && 'description' in opts ? opts.description : null;
      let dismissable = opts && 'dismissable' in opts ? opts.dismissable : null;
      let icon = opts && 'icon' in opts ? opts.icon : null;
      let buttons = opts && 'buttons' in opts ? opts.buttons : null;
      return new Notification(dart.as(this.invoke('addSuccess', message, this[_options]({detail: detail, description: description, dismissable: dismissable, icon: icon, buttons: buttons})), js.JsObject));
    }
    addInfo(message, opts) {
      let detail = opts && 'detail' in opts ? opts.detail : null;
      let description = opts && 'description' in opts ? opts.description : null;
      let dismissable = opts && 'dismissable' in opts ? opts.dismissable : null;
      let icon = opts && 'icon' in opts ? opts.icon : null;
      let buttons = opts && 'buttons' in opts ? opts.buttons : null;
      return new Notification(dart.as(this.invoke('addInfo', message, this[_options]({detail: detail, description: description, dismissable: dismissable, icon: icon, buttons: buttons})), js.JsObject));
    }
    addWarning(message, opts) {
      let detail = opts && 'detail' in opts ? opts.detail : null;
      let description = opts && 'description' in opts ? opts.description : null;
      let dismissable = opts && 'dismissable' in opts ? opts.dismissable : null;
      let icon = opts && 'icon' in opts ? opts.icon : null;
      let buttons = opts && 'buttons' in opts ? opts.buttons : null;
      return new Notification(dart.as(this.invoke('addWarning', message, this[_options]({detail: detail, description: description, dismissable: dismissable, icon: icon, buttons: buttons})), js.JsObject));
    }
    addError(message, opts) {
      let detail = opts && 'detail' in opts ? opts.detail : null;
      let description = opts && 'description' in opts ? opts.description : null;
      let dismissable = opts && 'dismissable' in opts ? opts.dismissable : null;
      let icon = opts && 'icon' in opts ? opts.icon : null;
      let buttons = opts && 'buttons' in opts ? opts.buttons : null;
      return new Notification(dart.as(this.invoke('addError', message, this[_options]({detail: detail, description: description, dismissable: dismissable, icon: icon, buttons: buttons})), js.JsObject));
    }
    addFatalError(message, opts) {
      let detail = opts && 'detail' in opts ? opts.detail : null;
      let description = opts && 'description' in opts ? opts.description : null;
      let dismissable = opts && 'dismissable' in opts ? opts.dismissable : null;
      let icon = opts && 'icon' in opts ? opts.icon : null;
      let buttons = opts && 'buttons' in opts ? opts.buttons : null;
      return new Notification(dart.as(this.invoke('addFatalError', message, this[_options]({detail: detail, description: description, dismissable: dismissable, icon: icon, buttons: buttons})), js.JsObject));
    }
    getNotifications() {
      return core.List$(Notification).from(dart.as(dart.dsend(this.invoke('getNotifications'), 'map', dart.fn(n => new Notification(dart.as(n, js.JsObject)), Notification, [dart.dynamic])), core.Iterable));
    }
    [_options](opts) {
      let detail = opts && 'detail' in opts ? opts.detail : null;
      let description = opts && 'description' in opts ? opts.description : null;
      let dismissable = opts && 'dismissable' in opts ? opts.dismissable : null;
      let icon = opts && 'icon' in opts ? opts.icon : null;
      let buttons = opts && 'buttons' in opts ? opts.buttons : null;
      if (detail == null && description == null && dismissable == null && icon == null && buttons == null) {
        return null;
      }
      let m = dart.map();
      if (detail != null) m.set('detail', detail);
      if (description != null) m.set('description', description);
      if (dismissable != null) m.set('dismissable', dismissable);
      if (icon != null) m.set('icon', icon);
      if (buttons != null) {
        m.set('buttons', js$.jsify(buttons[dartx.map](dart.fn(nb => nb.toProxy(), js.JsObject, [NotificationButton]))[dartx.toList]()));
      }
      return m;
    }
  }
  dart.setSignature(NotificationManager, {
    constructors: () => ({NotificationManager: [NotificationManager, [js.JsObject]]}),
    methods: () => ({
      addSuccess: [Notification, [core.String], {detail: core.String, description: core.String, dismissable: core.bool, icon: core.String, buttons: core.List$(NotificationButton)}],
      addInfo: [Notification, [core.String], {detail: core.String, description: core.String, dismissable: core.bool, icon: core.String, buttons: core.List$(NotificationButton)}],
      addWarning: [Notification, [core.String], {detail: core.String, description: core.String, dismissable: core.bool, icon: core.String, buttons: core.List$(NotificationButton)}],
      addError: [Notification, [core.String], {detail: core.String, description: core.String, dismissable: core.bool, icon: core.String, buttons: core.List$(NotificationButton)}],
      addFatalError: [Notification, [core.String], {detail: core.String, description: core.String, dismissable: core.bool, icon: core.String, buttons: core.List$(NotificationButton)}],
      getNotifications: [core.List$(Notification), []],
      [_options]: [core.Map, [], {detail: core.String, description: core.String, dismissable: core.bool, icon: core.String, buttons: core.List$(NotificationButton)}]
    })
  });
  class Notification extends js$.ProxyHolder {
    Notification(object) {
      super.ProxyHolder(object);
    }
    get view() {
      return exports$.atom.views.getView(this.obj);
    }
    get onDidDismiss() {
      return this.eventStream('onDidDismiss');
    }
    get dismissed() {
      return dart.as(this.obj.get('dismissed'), core.bool);
    }
    get displayed() {
      return dart.as(this.obj.get('displayed'), core.bool);
    }
    getType() {
      return dart.as(this.invoke('getType'), core.String);
    }
    getMessage() {
      return dart.as(this.invoke('getMessage'), core.String);
    }
    dismiss() {
      return this.invoke('dismiss');
    }
  }
  dart.setSignature(Notification, {
    constructors: () => ({Notification: [Notification, [js.JsObject]]}),
    methods: () => ({
      getType: [core.String, []],
      getMessage: [core.String, []],
      dismiss: [dart.void, []]
    })
  });
  class NotificationButton extends core.Object {
    NotificationButton(text, onDidClick) {
      this.text = text;
      this.onDidClick = onDidClick;
    }
    toProxy() {
      return dart.as(js$.jsify(dart.map({text: this.text, onDidClick: dart.fn(_ => dart.dcall(this.onDidClick))})), js.JsObject);
    }
  }
  dart.setSignature(NotificationButton, {
    constructors: () => ({NotificationButton: [NotificationButton, [core.String, core.Function]]}),
    methods: () => ({toProxy: [js.JsObject, []]})
  });
  class ViewRegistry extends js$.ProxyHolder {
    ViewRegistry(object) {
      super.ProxyHolder(object);
    }
    getView(object) {
      return this.invoke('getView', object);
    }
  }
  dart.setSignature(ViewRegistry, {
    constructors: () => ({ViewRegistry: [ViewRegistry, [js.JsObject]]}),
    methods: () => ({getView: [dart.dynamic, [dart.dynamic]]})
  });
  const _openSerializer = Symbol('_openSerializer');
  class Workspace extends js$.ProxyHolder {
    Workspace(object) {
      this[_openSerializer] = new (utils.FutureSerializer$(TextEditor))();
      super.ProxyHolder(object);
    }
    getTextEditors() {
      return core.List$(TextEditor).from(dart.as(dart.dsend(this.invoke('getTextEditors'), 'map', dart.fn(e => new TextEditor(dart.as(e, js.JsObject)), TextEditor, [dart.dynamic])), core.Iterable));
    }
    getActiveTextEditor() {
      let result = this.invoke('getActiveTextEditor');
      return result == null ? null : new TextEditor(dart.as(result, js.JsObject));
    }
    open(url, opts) {
      let options = opts && 'options' in opts ? opts.options : null;
      return this[_openSerializer].perform(dart.fn(() => {
        let future = js$.promiseToFuture(this.invoke('open', url, options));
        return future.then(dart.fn(result => {
          if (result == null) dart.throw(`unable to open ${url}`);
          let editor = new TextEditor(dart.as(result, js.JsObject));
          return dart.notNull(editor.isValid()) ? editor : null;
        }));
      }));
    }
  }
  dart.setSignature(Workspace, {
    constructors: () => ({Workspace: [Workspace, [js.JsObject]]}),
    methods: () => ({
      getTextEditors: [core.List$(TextEditor), []],
      getActiveTextEditor: [TextEditor, []],
      open: [async.Future$(TextEditor), [core.String], {options: core.Map}]
    })
  });
  class PackageManager extends js$.ProxyHolder {
    PackageManager(object) {
      super.ProxyHolder(object);
    }
    getApmPath() {
      return dart.as(this.invoke('getApmPath'), core.String);
    }
    getPackageDirPaths() {
      return core.List$(core.String).from(dart.as(this.invoke('getPackageDirPaths'), core.Iterable));
    }
    isBundledPackage(name) {
      return dart.as(this.invoke('isBundledPackage', name), core.bool);
    }
    isPackageLoaded(name) {
      return dart.as(this.invoke('isPackageLoaded', name), core.bool);
    }
    isPackageDisabled(name) {
      return dart.as(this.invoke('isPackageDisabled', name), core.bool);
    }
    isPackageActive(name) {
      return dart.as(this.invoke('isPackageActive', name), core.bool);
    }
    getAvailablePackageNames() {
      return core.List$(core.String).from(dart.as(this.invoke('getAvailablePackageNames'), core.Iterable));
    }
    activatePackage(name) {
      return js$.promiseToFuture(this.invoke('activatePackage', name));
    }
  }
  dart.setSignature(PackageManager, {
    constructors: () => ({PackageManager: [PackageManager, [js.JsObject]]}),
    methods: () => ({
      getApmPath: [core.String, []],
      getPackageDirPaths: [core.List$(core.String), []],
      isBundledPackage: [core.bool, [dart.dynamic]],
      isPackageLoaded: [core.bool, [core.String]],
      isPackageDisabled: [core.bool, [core.String]],
      isPackageActive: [core.bool, [core.String]],
      getAvailablePackageNames: [core.List$(core.String), []],
      activatePackage: [async.Future, [core.String]]
    })
  });
  class TextEditor extends js$.ProxyHolder {
    TextEditor(object) {
      super.ProxyHolder(_cvt(object));
    }
    isValid() {
      try {
        this.getTitle();
        this.getLongTitle();
        this.getPath();
        return true;
      } catch (e) {
        return false;
      }

    }
    getTitle() {
      return dart.as(this.invoke('getTitle'), core.String);
    }
    getLongTitle() {
      return dart.as(this.invoke('getLongTitle'), core.String);
    }
    getPath() {
      return dart.as(this.invoke('getPath'), core.String);
    }
    isModified() {
      return dart.as(this.invoke('isModified'), core.bool);
    }
    isEmpty() {
      return dart.as(this.invoke('isEmpty'), core.bool);
    }
    isNotEmpty() {
      return !dart.notNull(this.isEmpty());
    }
    save() {
      return this.invoke('save');
    }
  }
  dart.setSignature(TextEditor, {
    constructors: () => ({TextEditor: [TextEditor, [js.JsObject]]}),
    methods: () => ({
      isValid: [core.bool, []],
      getTitle: [core.String, []],
      getLongTitle: [core.String, []],
      getPath: [core.String, []],
      isModified: [core.bool, []],
      isEmpty: [core.bool, []],
      isNotEmpty: [core.bool, []],
      save: [dart.void, []]
    })
  });
  const _stdin = Symbol('_stdin');
  class BufferedProcess extends js$.ProxyHolder {
    static create(command, opts) {
      let args = opts && 'args' in opts ? opts.args : null;
      let stdout = opts && 'stdout' in opts ? opts.stdout : null;
      let stderr = opts && 'stderr' in opts ? opts.stderr : null;
      let exit = opts && 'exit' in opts ? opts.exit : null;
      let cwd = opts && 'cwd' in opts ? opts.cwd : null;
      let env = opts && 'env' in opts ? opts.env : null;
      let onWillThrowError = opts && 'onWillThrowError' in opts ? opts.onWillThrowError : null;
      let options = dart.map({command: command});
      if (args != null) options.set('args', args);
      if (stdout != null) options.set('stdout', stdout);
      if (stderr != null) options.set('stderr', stderr);
      if (exit != null) options.set('exit', exit);
      if (onWillThrowError != null) options.set('onWillThrowError', dart.fn(e => {
        e.callMethod('handle');
        dart.dcall(onWillThrowError, e.get('error'));
      }, dart.dynamic, [js.JsObject]));
      if (cwd != null || env != null) {
        let nodeOptions = dart.map();
        if (cwd != null) nodeOptions.set('cwd', cwd);
        if (env != null) nodeOptions.set('env', js$.jsify(env));
        options.set('options', nodeOptions);
      }
      let ctor = dart.as(node.require('atom').get('BufferedProcess'), js.JsFunction);
      return new BufferedProcess._(js.JsObject.new(ctor, [js.JsObject.jsify(options)]));
    }
    _(object) {
      this[_stdin] = null;
      super.ProxyHolder(object);
    }
    write(str) {
      if (this[_stdin] == null) this[_stdin] = dart.as(dart.dindex(this.obj.get('process'), 'stdin'), js.JsObject);
      this[_stdin].callMethod('write', [str, 'utf8']);
    }
    kill() {
      return this.invoke('kill');
    }
  }
  dart.defineNamedConstructor(BufferedProcess, '_');
  dart.setSignature(BufferedProcess, {
    constructors: () => ({_: [BufferedProcess, [js.JsObject]]}),
    methods: () => ({
      write: [dart.void, [core.String]],
      kill: [dart.void, []]
    }),
    statics: () => ({create: [BufferedProcess, [core.String], {args: core.List$(core.String), stdout: dart.functionType(dart.void, [core.String]), stderr: dart.functionType(dart.void, [core.String]), exit: dart.functionType(dart.void, [core.num]), cwd: core.String, env: core.Map$(core.String, core.String), onWillThrowError: core.Function}]}),
    names: ['create']
  });
  class AtomEvent extends js$.ProxyHolder {
    static new(object) {
      if (dart.is(object, js.JsObject)) {
        return new AtomEvent._fromJsObject(object);
      } else {
        return new _AtomEventCustomEvent(object);
      }
    }
    _fromJsObject(object) {
      super.ProxyHolder(_cvt(object));
    }
    get currentTarget() {
      return this.obj.get('currentTarget');
    }
    abortKeyBinding() {
      return this.invoke('abortKeyBinding');
    }
    get keyBindingAborted() {
      return dart.as(this.obj.get('keyBindingAborted'), core.bool);
    }
    preventDefault() {
      return this.invoke('preventDefault');
    }
    get defaultPrevented() {
      return dart.as(this.obj.get('defaultPrevented'), core.bool);
    }
    stopPropagation() {
      return this.invoke('stopPropagation');
    }
    stopImmediatePropagation() {
      return this.invoke('stopImmediatePropagation');
    }
    get propagationStopped() {
      return dart.as(this.obj.get('propagationStopped'), core.bool);
    }
  }
  dart.defineNamedConstructor(AtomEvent, '_fromJsObject');
  dart.setSignature(AtomEvent, {
    constructors: () => ({
      new: [AtomEvent, [dart.dynamic]],
      _fromJsObject: [AtomEvent, [js.JsObject]]
    }),
    methods: () => ({
      abortKeyBinding: [dart.void, []],
      preventDefault: [dart.void, []],
      stopPropagation: [dart.void, []],
      stopImmediatePropagation: [dart.void, []]
    })
  });
  class _AtomEventCustomEvent extends core.Object {
    _AtomEventCustomEvent(event) {
      this.event = event;
    }
    abortKeyBinding() {
      return dart.dsend(this.event, 'abortKeyBinding');
    }
    get currentTarget() {
      return dart.dload(this.event, 'currentTarget');
    }
    get defaultPrevented() {
      return dart.as(dart.dload(this.event, 'defaultPrevented'), core.bool);
    }
    eventStream(eventName) {
      dart.throw('unimplemented');
    }
    invoke(method, arg1, arg2, arg3) {
      if (arg1 === void 0) arg1 = null;
      if (arg2 === void 0) arg2 = null;
      if (arg3 === void 0) arg3 = null;
      dart.throw('unimplemented');
    }
    get keyBindingAborted() {
      return dart.as(dart.dload(this.event, 'keyBindingAborted'), core.bool);
    }
    get obj() {
      dart.throw('unimplemented');
    }
    preventDefault() {
      return dart.dsend(this.event, 'preventDefault');
    }
    get propagationStopped() {
      return dart.as(dart.dload(this.event, 'propagationStopped'), core.bool);
    }
    stopImmediatePropagation() {
      return dart.dsend(this.event, 'stopImmediatePropagation');
    }
    stopPropagation() {
      return dart.dsend(this.event, 'stopPropagation');
    }
  }
  _AtomEventCustomEvent[dart.implements] = () => [AtomEvent];
  dart.setSignature(_AtomEventCustomEvent, {
    constructors: () => ({_AtomEventCustomEvent: [_AtomEventCustomEvent, [dart.dynamic]]}),
    methods: () => ({
      abortKeyBinding: [dart.void, []],
      eventStream: [async.Stream, [core.String]],
      invoke: [dart.dynamic, [core.String], [dart.dynamic, dart.dynamic, dart.dynamic]],
      preventDefault: [dart.void, []],
      stopImmediatePropagation: [dart.void, []],
      stopPropagation: [dart.void, []]
    })
  });
  function _cvt(object) {
    if (object == null) return null;
    if (dart.is(object, js.JsObject)) return object;
    return js.JsObject.fromBrowserObject(object);
  }
  dart.fn(_cvt, js.JsObject, [js.JsObject]);
  // Exports:
  exports$.registerPackage = registerPackage;
  exports$.registerPackageDDC = registerPackageDDC;
  exports$.AtomPackage = AtomPackage;
  exports$.Atom = Atom;
  exports$.CommandRegistry = CommandRegistry;
  exports$.Config = Config;
  exports$.NotificationManager = NotificationManager;
  exports$.Notification = Notification;
  exports$.NotificationButton = NotificationButton;
  exports$.ViewRegistry = ViewRegistry;
  exports$.Workspace = Workspace;
  exports$.PackageManager = PackageManager;
  exports$.TextEditor = TextEditor;
  exports$.BufferedProcess = BufferedProcess;
  exports$.AtomEvent = AtomEvent;
});
//# sourceMappingURL=atom.js.map