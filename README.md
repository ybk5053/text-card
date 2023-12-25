# Text-Card
Text Input Card for Home Assistant Dashboard

## Config

### `entries`

Hold an array of input lines to show

| Key | Desc | eg. |
|--|--|--|
| name | Label for input field | `Value` |
| data_key | Key to place value in for service call<br>(Separate nested fields with ".") | `value.data1`  |
| icon | Icon for submit button<br>(Leave empty if no button) | `mdi:send` |

### `action`

Hold the service the call

| Key | Desc | eg. |
|--|--|--|
| service | Service to call | `input_number.set_value` |
| target.entity_id | target entity | `input_number.helper`  |
| data | Any data for the service | `{"value": 1, "data": 2}` |

### Sample

```
type: custom:text-card
entries:
  - name: input1
    data_key: entity_id
  - name: input2
    icon: mdi:send
    data_key: value
action:
  service: input_text.set_value
```

```
type: custom:text-card
entries:
  - name: input1
    data_key: data.value1
  - name: input2
    icon: mdi:send
    data_key: data.value2
action:
  service: input_text.set_value
  target:
    entity_id: input_number.abc
  data:
    number: 1
```
