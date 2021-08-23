BIN = node_modules/.bin
BUILD_DIR = build
TSC = $(BIN)/tsc
TSC_CONFIG = tsconfig.json
TSLINT = $(BIN)/tslint
TS_SRC = $(shell find src -type f -name "*.ts")

.PHONY: setup
setup:
	npm install

.PHONY: clean
clean:
	rm -rf $(BUILD_DIR)

.PHONY: build
build: clean
	$(TSC) -p $(TSC_CONFIG)

.PHONY: watch
watch: clean
	$(TSC) -p $(TSC_CONFIG) -w

.PHONY: lint
lint:
	$(TSLINT) --config tslint.json --project $(TSC_CONFIG) --format verbose $(TS_SRC)

.PHONY: extract
extract: $(BUILD_DIR)/extract.js
	node $(BUILD_DIR)/extract.js
