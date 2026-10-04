UPDATE `notes` SET `content` = replace(`content`, '"type":"heading","attrs":{"level":4}', '"type":"heading","attrs":{"level":3}') WHERE `content` LIKE '%"type":"heading","attrs":{"level":4}%';
