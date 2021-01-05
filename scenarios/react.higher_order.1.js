
  ReactDOM.render(
    <Observer>
      {() => (
        <Code key={key} measures={measures} />
      )}
    </Observer>,
    document.body.appendChild(document.createElement('div')),
  )

// plus: [import queue] << 'import { Observer } from "mobx"' 
